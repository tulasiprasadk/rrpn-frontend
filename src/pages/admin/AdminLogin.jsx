import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { API_BASE } from "../../config/api";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAdminAuth();

  const [form, setForm] = useState({
    email: "",
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
      console.log('Attempting admin login (password bypass mode):', form.email);
      // Password is optional now - send empty string if not provided
      const loginData = {
        email: form.email,
        password: form.password || '' // Optional for debugging
      };
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });
      
      console.log('Login response status:', res.status);
      console.log('Login response headers:', Object.fromEntries(res.headers.entries()));

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

      // Store admin data in context
      if (data && data.admin) {
        loginAdmin(data.admin.id.toString(), data.admin);
      }

      // Session is set on backend, just navigate
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

        <label>Email</label>
        <input
          required
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
        />

        <label>Password (Optional - Currently Disabled for Debugging)</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password check is disabled - leave empty"
        />

        <button type="submit" className="admin-login-btn">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;



