// frontend/src/pages/Login.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestOtp = async () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }

    try {
      setLoading(true);

      // IMPORTANT:
      // This uses axios.defaults.baseURL
      // which is set in main.jsx

      await axios.post(
        `${API_BASE}/supplier/auth/request-email-otp`,
        { email }
      );

      navigate("/verify", { state: { email } });

    } catch (err) {
      console.error("OTP Request Error:", err);

      let msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to send OTP, please try again.";

      if (typeof msg === "object") {
        msg = JSON.stringify(msg);
      }

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Login with Email</h2>

      <input
        type="email"
        value={email}
        placeholder="Enter email address"
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "8px",
          width: "250px",
          marginTop: "10px",
          display: "block",
        }}
      />

      <button
        onClick={requestOtp}
        disabled={loading}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          background: loading ? "#999" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending OTP..." : "Get OTP"}
      </button>
    </div>
  );
}
