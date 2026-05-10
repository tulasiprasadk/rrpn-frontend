import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const baseName = import.meta.env.VITE_BASE_URL || "/";

// Load Google Maps script (if API key is provided)
if (typeof window !== "undefined") {
  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();

  if (googleMapsKey) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      googleMapsKey
    )}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

// Unregister service workers in development to avoid cache issues
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();

      for (const r of regs) {
        try {
          await r.unregister();
        } catch (e) {
          // ignore
        }
      }

      try {
        const single = await navigator.serviceWorker.getRegistration("/sw.js");
        if (single) await single.unregister();
      } catch (e) {
        // ignore
      }

      console.log("Service workers unregistered for local dev");
    } catch (e) {
      console.warn("SW unregister failed", e);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);