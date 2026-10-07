from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def build_context_info(language: str | None, hotwords: list[str]) -> str | None:
    parts: list[str] = []
    if language:
        parts.append(f"Preferred language: {language}")
    if hotwords:
        parts.append("Hotwords: " + ", ".join(word for word in hotwords if word))
    if not parts:
        return None
    return "\n".join(parts)


def load_pipeline(repo_dir: Path, model_path: str, device: str):
    sys.path.insert(0, str(repo_dir))

    import torch
    from vibevoice.modular.modeling_vibevoice_asr import VibeVoiceASRForConditionalGeneration
    from vibevoice.processor.vibevoice_asr_processor import VibeVoiceASRProcessor

    resolved_device = device
    if resolved_device == "auto":
        resolved_device = "cuda" if torch.cuda.is_available() else "cpu"

    dtype = torch.bfloat16 if resolved_device.startswith("cuda") else torch.float32

    processor = VibeVoiceASRProcessor.from_pretrained(
        model_path,
        language_model_pretrained_name="Qwen/Qwen2.5-7B",
    )
    model = VibeVoiceASRForConditionalGeneration.from_pretrained(
        model_path,
        dtype=dtype,
        device_map=None,
        attn_implementation="sdpa",
        trust_remote_code=True,
    )
    model = model.to(resolved_device)
    model.eval()
    return torch, processor, model, resolved_device


def main() -> None:
    parser = argparse.ArgumentParser(description="VideoSync adapter for vendored VibeVoice ASR")
    parser.add_argument("--repo_dir", required=True)
    parser.add_argument("--model_path", required=True)
    parser.add_argument("--audio_file", required=True)
    parser.add_argument("--language", default="")
    parser.add_argument("--hotwords", default="")
    parser.add_argument("--context_info", default="")
    parser.add_argument("--device", default="auto")
    parser.add_argument("--max_new_tokens", type=int, default=1024)
    args = parser.parse_args()

    repo_dir = Path(args.repo_dir).resolve()
    audio_file = Path(args.audio_file).resolve()
    hotwords = [word.strip() for word in args.hotwords.split(",") if word.strip()]
    built_context = build_context_info(args.language.strip() or None, hotwords)
    extra_context = args.context_info.strip()
    if built_context and extra_context:
        context_info = f"{built_context}\n{extra_context}"
    else:
        context_info = built_context or extra_context or None

    torch, processor, model, device = load_pipeline(repo_dir, args.model_path, args.device)

    inputs = processor(
        audio=str(audio_file),
        sampling_rate=None,
        return_tensors="pt",
        padding=True,
        add_generation_prompt=True,
        context_info=context_info,
    )
    inputs = {
        key: value.to(device) if isinstance(value, torch.Tensor) else value
        for key, value in inputs.items()
    }

    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=args.max_new_tokens,
            pad_token_id=processor.pad_id,
            eos_token_id=processor.tokenizer.eos_token_id,
            do_sample=False,
        )

    input_length = inputs["input_ids"].shape[1]
    generated_ids = output_ids[0, input_length:]
    eos_positions = (generated_ids == processor.tokenizer.eos_token_id).nonzero(as_tuple=True)[0]
    if len(eos_positions) > 0:
        generated_ids = generated_ids[: eos_positions[0] + 1]

    raw_text = processor.decode(generated_ids, skip_special_tokens=True).strip()
    try:
        segments = processor.post_process_transcription(raw_text)
    except Exception:
        segments = []

    if segments:
        transcript_text = " ".join(
            segment.get("text", "").strip() for segment in segments if segment.get("text")
        ).strip()
    else:
        transcript_text = raw_text

    payload = {
        "provider": "vibevoice-asr",
        "model": args.model_path,
        "device": device,
        "text": transcript_text,
        "raw_text": raw_text,
        "segments": segments,
        "hotwords": hotwords,
        "language": args.language.strip() or None,
        "context_info": context_info,
    }
    print(json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    main()
