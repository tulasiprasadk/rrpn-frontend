

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";
import GoogleSignInButton from "../components/GoogleSignInButton";
  // Google OAuth handler
function handleGoogleSignIn() {
  window.location.href = `${API_BASE}/api/suppliers/auth/google`;
}

export default function SupplierLogin() {
  const [form, setForm] = useState({ phone: "", password: "" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setSuccess("");
    setLoading(true);

    if (!form.phone) {
      setErr("Please provide your phone number.");
      setLoading(false);
      return;
    }
    if (!form.password) {
      setErr("Please enter your password.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/suppliers/login`, { phone: form.phone, password: form.password }, { withCredentials: true });
      if (res.data.ok) {
        setSuccess("Login successful!");
        navigate("/supplier/dashboard");
      }
    } catch (error) {
      const backendMsg = error?.response?.data?.error || "Failed to login";
      if (backendMsg.toLowerCase().includes("pending") || backendMsg.toLowerCase().includes("approve")) {
        setErr("Your account is pending admin approval. Please wait for approval before logging in.");
      } else {
        setErr(backendMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>Supplier Sign In</h1>

      {err && <div style={{ color: "red", marginBottom: 12, padding: 10, background: "#ffebee", borderRadius: 4 }}>{err}</div>}
      {success && <div style={{ color: "green", marginBottom: 12, padding: 10, background: "#e8f5e9", borderRadius: 4 }}>{success}</div>}


      <form onSubmit={submit} style={{ maxWidth: 420 }}>
        <label style={{ display: "block", marginBottom: 12 }}>
          Phone Number
          <br />
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="Enter your phone number"
            style={{ width: "100%", padding: 10, marginTop: 8, fontSize: 14, border: "1px solid #ccc", borderRadius: 4 }}
            required
          />
        </label>
        <label style={{ display: "block", marginBottom: 12 }}>
          Password
          <br />
          <input
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Enter your password"
            style={{ width: "100%", padding: 10, marginTop: 8, fontSize: 14, border: "1px solid #ccc", borderRadius: 4 }}
            required
          />
        </label>
        <div style={{ marginTop: 12 }}>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#ffd600",
              border: "none",
              cursor: "pointer",
              borderRadius: 4,
              fontSize: 16,
              fontWeight: "bold"
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
        <GoogleSignInButton onClick={handleGoogleSignIn} label="Sign in with Google (Supplier)" />
      </form>

      <div style={{ marginTop: 24, color: "#666" }}>
        <span>
          Don't have an account? <a href="/supplier/register" style={{ color: "#1976d2", textDecoration: "underline" }}>Register Here</a>
        </span>
        <br />
        <span>
          <a href="/supplier/forgot-password" style={{ color: "#1976d2", textDecoration: "underline" }}>Forgot Password?</a>
        </span>
      </div>
    </main>
  );
}
