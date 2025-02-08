import React from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const initialData = window.__INITIAL_DATA__ || {};
const { isAuthenticated, user } = initialData;

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <BrowserRouter>
    <App isAuthenticated={isAuthenticated} user={user} />
  </BrowserRouter>,
);

// Only run SW code if available
if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("/service-worker.js");

      // 1. Listen for SW updates
      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener("statechange", () => {
            if (
              installingWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // We have a new SW in the waiting state.
              // Show your "New version available" prompt
              promptUserForUpdate(registration);
            }
          });
        }
      });

      // 2. Check for new SW every minute
      setInterval(() => {
        registration.update();
      }, 60_000);

      // 3. If the new SW activates, `controllerchange` fires
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      });
    } catch (err) {
      console.error("Service Worker registration failed:", err);
    }
  });
}

/**
 * Prompt user that a new version is available.
 * If they confirm, send a message to the waiting SW to skip waiting.
 */
function promptUserForUpdate(registration: ServiceWorkerRegistration) {
  const shouldUpdate = window.confirm(
    "A new version of the app is available. Update now?",
  );
  if (shouldUpdate && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
}
