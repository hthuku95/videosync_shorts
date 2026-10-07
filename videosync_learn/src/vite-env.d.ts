/// <reference types="vite/client" />

interface Window {
  paypal?: {
    Buttons: (options: {
      style?: Record<string, unknown>;
      createOrder: () => Promise<string>;
      onApprove: (data: { orderID: string }) => Promise<void>;
    }) => { render: (element: string | HTMLElement) => Promise<void> };
  };
}