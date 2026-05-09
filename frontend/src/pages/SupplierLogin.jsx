import React from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config/api";
import GoogleSignInButton from "../components/GoogleSignInButton";

// Google OAuth handler
function handleGoogleSignIn() {
  // IMPORTANT: API_BASE already includes /api
  window.location.href = `${API_BASE}/suppliers/auth/google`;
}

export default function SupplierLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const alertStyles = {
    info: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    success: { background: "#ecfdf3", color: "#027a48", border: "1px solid #86efac" },
    warning: { background: "#fff7cc", color: "#854d0e", border: "1px solid #fde68a" },
    error: { background: "#fff1f2", color: "#b42318", border: "1px solid #fda4af" },
  };

  const statusCard = (() => {
    if (searchParams.get("kyc_submitted")) {
      return {
        tone: "success",
        title: "KYC submitted successfully",
        text: "Your supplier profile has been sent for admin review. You will be able to access the supplier dashboard once your KYC is approved.",
      };
    }

    if (searchParams.get("kyc_pending")) {
      return {
        tone: "warning",
        title: "KYC already submitted",
        text: "Your supplier account is waiting for admin approval. Dashboard access will unlock after approval.",
      };
    }

    if (searchParams.get("pending")) {
      return {
        tone: "warning",
        title: "Approval pending",
        text: "Your supplier account is still under review. Please try again after approval.",
      };
    }

    if (searchParams.get("oauth_error")) {
      return {
        tone: "error",
        title: "Google sign-in could not be completed",
        text: "Please try Google login again. If the issue repeats, we should check the supplier OAuth callback settings.",
      };
    }

    return null;
  })();

  const submittedEmail = location.state?.email;
  const submittedBusinessName = location.state?.businessName;

  return (
    <main style={{ padding: 24, maxWidth: 500, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>Supplier Sign In</h1>
      <div style={{ marginBottom: 12, padding: 10, background: "#fff9c4", borderRadius: 4 }}>
        Supplier login is currently available via Google only.
      </div>

      {statusCard && (
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 10,
            ...alertStyles[statusCard.tone],
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{statusCard.title}</div>
          <div>{statusCard.text}</div>
          {(submittedEmail || submittedBusinessName) && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              {submittedBusinessName ? `Business: ${submittedBusinessName}` : null}
              {submittedBusinessName && submittedEmail ? " | " : null}
              {submittedEmail ? `Email: ${submittedEmail}` : null}
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: 420 }}>
        <GoogleSignInButton
          onClick={handleGoogleSignIn}
          label="Continue with Google"
        />
      </div>

      <div style={{ marginTop: 24, color: "#666" }}>
        <span>
          Don't have an account?{" "}
          <a
            href="/supplier/register"
            style={{
              color: "#1976d2",
              textDecoration: "underline"
            }}
          >
            Register Here
          </a>
        </span>
        <br />
        <span>
          <button
            onClick={() => navigate("/supplier/register")}
            style={{ color: "#1976d2", background: "transparent", border: "none", textDecoration: "underline", cursor: "pointer", padding: 0 }}
          >
            Register Here
          </button>
        </span>
      </div>
    </main>
  );
}



