// frontend/src/pages/Login.jsx

import { useState, useEffect } from "react";
import { API_BASE } from "../config/api";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [googleAvailable, setGoogleAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/auth/status');
        if (!mounted) return;
        console.log('Auth status response:', res.data);
        setGoogleAvailable(!!res.data?.googleConfigured);
      } catch (err) {
        console.error('Error checking auth status:', err);
        // assume not configured
        if (mounted) setGoogleAvailable(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleLogin = async () => {
    if (!email) {
      alert("Please enter an email address");
      return;
    }
    navigate("/verify", { state: { email } });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ display: 'flex', gap: 28, alignItems: 'stretch' }}>
        <div style={{ width: 440, background: 'white', padding: 28, borderRadius: 12, boxShadow: '0 6px 30px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <img src="/images/rrlogo.png" alt="logo" style={{ width: 72, height: 72, borderRadius: 10 }} />
            <h2 style={{ margin: '10px 0 6px' }}>Welcome Back</h2>
            <div style={{ color: '#666' }}>Sign in to continue to RR Nagar</div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: 6 }}>Email address</label>
            <input
              type="email"
              value={email}
              placeholder="you@company.com"
              onChange={(e) => setEmail(e.target.value)}
              style={{ padding: '12px 14px', width: '100%', borderRadius: 8, border: '1px solid #e3e3e3' }}
            />
          </div>

          <button
            onClick={handleLogin}
            style={{
              marginTop: 18,
              width: '100%',
              padding: '12px 16px',
              background: 'linear-gradient(90deg,#28a745,#1e7e34)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 16
            }}
          >
            Continue with email
          </button>

          <div style={{ textAlign: 'center', margin: '14px 0', color: '#999' }}>or</div>

          {googleAvailable ? (
            <button
              onClick={() => {
                window.location.href = `${API_BASE}/customers/auth/google`;
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '10px 16px',
                width: '100%',
                background: '#ffffff',
                border: '1px solid #e6e6e6',
                color: '#444',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <img src="https://developers.google.com/identity/images/g-logo.png" alt="G" style={{ width: 20 }} />
              Sign in with Google
            </button>
          ) : (
            <div style={{ padding: 12, borderRadius: 8, background: '#fff3f0', border: '1px solid #ffd6cc', color: '#b33' }}>
              Google OAuth is not configured on the server. Contact the dev to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.
            </div>
          )}

          <div style={{ marginTop: 14, fontSize: 13, color: '#666', textAlign: 'center' }}>
            By continuing you agree to our Terms of Service.
          </div>
        </div>

        <aside style={{ width: 360, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ padding: 18, borderRadius: 12, background: '#fff8e1', border: '1px solid #ffe082', boxShadow: '0 6px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 8px' }}>Special Offer</h3>
            <p style={{ margin: 0, color: '#4a3b00' }}>New users get 10% off your first order. Use code <strong>WELCOME10</strong> at checkout.</p>
          </div>

          <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #eee', textAlign: 'center' }}>
            <a href="https://motardgears.com" target="_blank" rel="noreferrer" style={{ display: 'inline-block', textDecoration: 'none', color: 'inherit' }}>
              <img src="/motard.svg" alt="Motard" style={{ width: 120, height: 120, display: 'block', margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 700, color: '#e65a00' }}>Motard Gears</div>
              <div style={{ fontSize: 13, color: '#666' }}>Premium motor accessories</div>
            </a>
          </div>

          <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #eee', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 6px' }}>Why shop with us?</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#555' }}>
              <li>• Fast local delivery</li>
              <li>• Trusted sellers</li>
              <li>• Secure payments</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}



