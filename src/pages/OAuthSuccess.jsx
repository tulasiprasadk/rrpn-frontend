import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role") || "user";

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // 🔑 CRITICAL: update auth state BEFORE navigating
    login({ role }, token);

    // 🔁 Redirect to correct dashboard
    navigate(
      role === "supplier"
        ? "/supplier/dashboard"
        : "/customer/dashboard",
      { replace: true }
    );
  }, []);

  return <div style={{ padding: 20 }}>Signing you in…</div>;
}
