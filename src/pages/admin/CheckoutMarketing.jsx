import React, { useEffect, useState } from "react";
import api from "../../api/client";

export default function CheckoutMarketing() {
  const [offersText, setOffersText] = useState("[]");
  const [adsText, setAdsText] = useState("[]");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const [offersRes, adsRes] = await Promise.all([
        api.get("/admin/config/checkout_offers"),
        api.get("/admin/config/checkout_ads"),
      ]);
      setOffersText(JSON.stringify(offersRes.data?.value || [], null, 2));
      setAdsText(JSON.stringify(adsRes.data?.value || [], null, 2));
    } catch (err) {
      // If config doesn't exist yet, show empty arrays
      setOffersText("[]");
      setAdsText("[]");
      setMessage("Create offers/ads and click Save.");
    }
  };

  const saveConfig = async (key, valueText) => {
    let parsed;
    try {
      parsed = JSON.parse(valueText);
    } catch (err) {
      setMessage(`Invalid JSON for ${key}: ${err.message}`);
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await api.put(`/admin/config/${key}`, {
        value: parsed,
        type: "json",
        category: "cms",
      });
      setMessage("Saved successfully.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 8 }}>Checkout Offers & Ads</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Manage promo offers and checkout ads shown on the payment page.
      </p>

      {message && (
        <div style={{ marginBottom: 16, padding: 10, background: "#fff3cd", borderRadius: 6 }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gap: 20 }}>
        <section style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #eee" }}>
          <h2 style={{ marginTop: 0 }}>Checkout Offers</h2>
          <p style={{ fontSize: 12, color: "#666" }}>
            JSON array: [{"{"}"title","description","code","type","value"{"}"}]. Type: "percent" or "flat".
          </p>
          <textarea
            rows={10}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
            value={offersText}
            onChange={(e) => setOffersText(e.target.value)}
          />
          <button
            onClick={() => saveConfig("checkout_offers", offersText)}
            disabled={saving}
            style={{ marginTop: 10, padding: "8px 14px" }}
          >
            {saving ? "Saving..." : "Save Offers"}
          </button>
        </section>

        <section style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #eee" }}>
          <h2 style={{ marginTop: 0 }}>Checkout Ads</h2>
          <p style={{ fontSize: 12, color: "#666" }}>
            JSON array: [{"{"}"title","text","image","link"{"}"}]
          </p>
          <textarea
            rows={10}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
            value={adsText}
            onChange={(e) => setAdsText(e.target.value)}
          />
          <button
            onClick={() => saveConfig("checkout_ads", adsText)}
            disabled={saving}
            style={{ marginTop: 10, padding: "8px 14px" }}
          >
            {saving ? "Saving..." : "Save Ads"}
          </button>
        </section>
      </div>
    </div>
  );
}
