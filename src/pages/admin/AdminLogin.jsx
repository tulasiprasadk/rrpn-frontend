import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";
import "./AdminLogin.css";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // non-JSON response
        data = null;
      }

      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `Server error ${res.status}`;
        setError(msg);
        return;
      }

      if (data?.token) {
        loginAdmin(data.token, data.admin || null);
      }

      // Session is set on backend (or token stored), just navigate
      navigate("/admin");
    } catch (err) {
      setError(err?.message || "Server error. Try again.");
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-box" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        {error && <div className="admin-error">{error}</div>}

        <label>Email or Mobile</label>
        <input
          required
          name="identifier"
          type="text"
          placeholder="you@example.com or 9876543210"
          value={form.identifier}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          required
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        <button type="submit" className="admin-login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;



