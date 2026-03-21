import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import axios from "axios";
import "./api/axiosConfig";
import { BACKEND_BASE, resolveApiRequestUrl } from "./config/api";

axios.defaults.withCredentials = true;
const baseName = import.meta.env.VITE_BASE_URL || "/";

if (typeof window !== "undefined") {
  window.__RRN_API_BASE = BACKEND_BASE;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const nextUrl = resolveApiRequestUrl(typeof input === "string" ? input : input?.url);
    if (!nextUrl || (typeof input !== "string" && nextUrl === input?.url)) {
      return originalFetch(input, init);
    }
    return originalFetch(nextUrl, init);
  };

  const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim();
  if (googleMapsKey) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsKey)}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

if ("serviceWorker" in navigator) {
  // During local development ensure any previously-registered service workers
  // are unregistered so cached assets (pointing to old ports) do not interfere.
  window.addEventListener("load", async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        try { await r.unregister(); } catch (e) { /* ignore */ }
      }
      // Also attempt to unregister specific registration for /sw.js
      try {
        const single = await navigator.serviceWorker.getRegistration('/sw.js');
        if (single) await single.unregister();
      } catch (e) {}
      console.log('Service workers unregistered for local dev');
    } catch (e) {
      console.warn('SW unregister failed', e);
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



