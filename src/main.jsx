import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import axios from "axios";
import { AuthProvider } from "./context/AuthContext";

axios.defaults.withCredentials = true;
const baseName = import.meta.env.VITE_BASE_URL || "/";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename={baseName}>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
