# VideoSync Studio

Standalone React/TypeScript sales app for `studio.videosync.video`.

Purpose:

- Present the managed campaign service offers without mixing them into the main $15/month VideoSync workspace.
- Collect paid service-pack orders through the VideoSync backend PayPal endpoints.
- Send qualified buyers into delivery/sample workflows after checkout.

Backend dependencies:

- `GET /api/paypal/config`
- `POST /api/paypal/orders`
- `POST /api/paypal/orders/:order_id/capture`
- Existing VideoSync service/sample and delivery routes.

Suggested GCP deployment:

1. Build this folder as a separate Cloud Run service named `videosync-studio`.
2. Map `studio.videosync.video` to that Cloud Run service.
3. Set `VITE_VIDEOSYNC_API_BASE=https://www.videosync.video` at build time.
