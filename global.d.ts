export {};

declare global {
  interface Window {
    adsbygoogle: Array<{ push: () => void }>;
  }
}
