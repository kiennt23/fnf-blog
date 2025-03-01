export {};

declare global {
  declare module "*.module.css";

  type AppProps = {
    isAuthenticated?: boolean;
    user?: { name?: string; email?: string };
  };

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
    __MANIFEST_DATA__?: {
      [propName: string]: {
        [propName: string]: string;
      };
    };
  }

  interface WorkerGlobalScope {
    skipWaiting(): void;
  }

  interface ImportMeta {
    env?: {
      SSR?: boolean;
    };
    hot?: {
      accept: (module: string, callback?: () => void) => void;
      dispose: (callback: (data: never) => void) => void;
    };
  }
}
