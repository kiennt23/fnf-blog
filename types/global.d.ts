export {};

declare global {
  interface Window {
    __INITIAL_DATA__?: {
      isAuthenticated?: boolean;
      user?: {
        name?: string;
        email?: string;
        // Add whatever fields you're embedding
      };
      // ...any other data
    };
  }

  interface WorkerGlobalScope {
    skipWaiting(): void;
  }
}
