// src/components/GoogleSignInButton.jsx
import React from "react";

export default function GoogleSignInButton({ onClick, label = "Sign in with Google" }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        background: "#fff",
        color: "#444",
        border: "1px solid #ccc",
        borderRadius: 4,
        padding: "10px 20px",
        fontSize: 16,
        fontWeight: 500,
        cursor: "pointer",
        marginTop: 16
      }}
    >
      <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 22, marginRight: 12 }} />
      {label}
    </button>
  );
}



