import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const baseName = import.meta.env.VITE_BASE_URL || "/";

// Load Google Maps script (optional)
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter basename={baseName}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);