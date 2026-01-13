import React, { useState } from "react";
import MessagingModal from "./MessagingModal";
import { sendWhatsAppMessage } from "../api/whatsapp";

/**
 * FloatingMessageButton
 * - Shows a small floating button in bottom-right on every page
 * - Opens MessagingModal and relays message to WhatsApp via sendWhatsAppMessage
 *
 * Usage: import and render once at app root (main.jsx or App.jsx)
 */
export default function FloatingMessageButton({ recipientName = "Support", senderId = null }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSend(payload) {
    setError("");
    setBusy(true);
    try {
      const bodyPayload = {
        fromName: payload.fromName || "Website user",
        fromId: payload.fromId || senderId || null,
        subject: payload.subject || "",
        body: payload.body || "",
        // toNumber left empty so server uses WHATSAPP_TARGET_NUMBER
      };
      const result = await sendWhatsAppMessage(bodyPayload);
      setBusy(false);
      return result;
    } catch {
      setBusy(false);
      setError(err.message || "Failed to send");
      throw err;
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Message us"
        title="Message us"
        style={{
          position: "fixed",
          right: 18,
          bottom: 90,
          zIndex: 9999,
          background: "#25D366",
          color: "#fff",
          border: "none",
          padding: "12px 14px",
          borderRadius: 999,
          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 600,
        }}
      >
        <span style={{ display: 'inline-flex', width: 18, height: 18 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 7C3 5.89543 3.89543 5 5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7Z" fill="#FFFFFF"/>
            <path d="M5 7L12 12L19 7" stroke="#25D366" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span style={{ fontSize: 13 }}>Message us</span>
      </button>

      <MessagingModal
        open={open}
        onClose={() => setOpen(false)}
        onSend={handleSend}
        recipientId={null}
        recipientName={recipientName}
        senderId={senderId}
      />

      {busy && (
        <div style={{ position: "fixed", right: 18, bottom: 140, zIndex: 9999, fontSize: 12, color: "#333" }}>
          Sending...
        </div>
      )}
      {error && (
        <div style={{ position: "fixed", right: 18, bottom: 140, zIndex: 9999, fontSize: 12, color: "crimson" }}>
          {error}
        </div>
      )}
    </>
  );
}



