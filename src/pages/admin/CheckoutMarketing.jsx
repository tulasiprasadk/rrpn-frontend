import React, { useEffect, useState } from "react";
import api from "../../api/client";

export default function CheckoutMarketing() {
  const [offersText, setOffersText] = useState("[]");
  const [adsText, setAdsText] = useState("[]");
  const [megaLeftText, setMegaLeftText] = useState("[]");
  const [megaRightText, setMegaRightText] = useState("[]");
  const [scrollingText, setScrollingText] = useState("[]");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const [offersRes, adsRes, megaLeftRes, megaRightRes, scrollingRes] = await Promise.all([
        api.get("/admin/config/checkout_offers"),
        api.get("/admin/config/checkout_ads"),
        api.get("/admin/config/mega_ads_left"),
        api.get("/admin/config/mega_ads_right"),
        api.get("/admin/config/scrolling_ads"),
      ]);
      setOffersText(JSON.stringify(offersRes.data?.value || [], null, 2));
      setAdsText(JSON.stringify(adsRes.data?.value || [], null, 2));
      setMegaLeftText(JSON.stringify(megaLeftRes.data?.value || [], null, 2));
      setMegaRightText(JSON.stringify(megaRightRes.data?.value || [], null, 2));
      setScrollingText(JSON.stringify(scrollingRes.data?.value || [], null, 2));
      setMessage("");
    } catch (err) {
      // Fallback: try public CMS endpoints so admins can view existing ads without session
      try {
        const [offersRes, adsRes, megaLeftRes, megaRightRes, scrollingRes] = await Promise.all([
          api.get("/cms/checkout-offers"),
          api.get("/cms/checkout-ads"),
          api.get("/cms/mega-ads/left"),
          api.get("/cms/mega-ads/right"),
          api.get("/cms/scrolling-ads"),
        ]);
        setOffersText(JSON.stringify(offersRes.data || [], null, 2));
        setAdsText(JSON.stringify(adsRes.data || [], null, 2));
        setMegaLeftText(JSON.stringify(megaLeftRes.data || [], null, 2));
        setMegaRightText(JSON.stringify(megaRightRes.data || [], null, 2));
        setScrollingText(JSON.stringify(scrollingRes.data || [], null, 2));
        setMessage("Viewing public CMS data. Login to edit.");
      } catch (err2) {
        // If everything fails, show empty arrays
        setOffersText("[]");
        setAdsText("[]");
        setMegaLeftText("[]");
        setMegaRightText("[]");
        setScrollingText("[]");
        setMessage("Create offers/ads and click Save.");
      }
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
          <h2 style={{ marginTop: 0 }}>Mega Ads — Left Sidebar</h2>
          <p style={{ fontSize: 12, color: "#666" }}>JSON array of ads. Example: [{"title":"...","image":"...","link":"..."}]</p>
          <textarea
            rows={6}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
            value={megaLeftText}
            onChange={(e) => setMegaLeftText(e.target.value)}
          />
          <button
            onClick={() => saveConfig("mega_ads_left", megaLeftText)}
            disabled={saving}
            style={{ marginTop: 10, padding: "8px 14px" }}
          >
            {saving ? "Saving..." : "Save Mega Left"}
          </button>
        </section>

        <section style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #eee" }}>
          <h2 style={{ marginTop: 0 }}>Mega Ads — Right Sidebar</h2>
          <p style={{ fontSize: 12, color: "#666" }}>JSON array of ads. Example: [{"title":"...","image":"...","link":"..."}]</p>
          <textarea
            rows={6}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
            value={megaRightText}
            onChange={(e) => setMegaRightText(e.target.value)}
          />
          <button
            onClick={() => saveConfig("mega_ads_right", megaRightText)}
            disabled={saving}
            style={{ marginTop: 10, padding: "8px 14px" }}
          >
            {saving ? "Saving..." : "Save Mega Right"}
          </button>
        </section>

        <section style={{ background: "#fff", padding: 16, borderRadius: 8, border: "1px solid #eee" }}>
          <h2 style={{ marginTop: 0 }}>Scrolling Ads</h2>
          <p style={{ fontSize: 12, color: "#666" }}>JSON array for banner/scrolling ads.</p>
          <textarea
            rows={6}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
            value={scrollingText}
            onChange={(e) => setScrollingText(e.target.value)}
          />
          <button
            onClick={() => saveConfig("scrolling_ads", scrollingText)}
            disabled={saving}
            style={{ marginTop: 10, padding: "8px 14px" }}
          >
            {saving ? "Saving..." : "Save Scrolling Ads"}
          </button>
        </section>
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
