import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import axios from "axios";
import { AuthProvider } from "./context/AuthContext";
import AuthProviderWrapper from "./auth0-provider.jsx";

axios.defaults.withCredentials = true;
const baseName = import.meta.env.VITE_BASE_URL || "/";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthProviderWrapper>
        <BrowserRouter basename={baseName}>
          <App />
        </BrowserRouter>
      </AuthProviderWrapper>
    </AuthProvider>
  </React.StrictMode>
);
