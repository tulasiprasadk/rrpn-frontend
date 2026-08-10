import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../api/client";

const AdminAdForm = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [sourceType, setSourceType] = useState("cms");
  const [placement, setPlacement] = useState("checkout_ads");
  const [active, setActive] = useState(true);
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const isEditing = mode === "edit";

  const readImageAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read selected image"));
      reader.readAsDataURL(file);
    });

  const placementOptions = {
    cms: [
      { value: "checkout_ads", label: "Checkout Ads" },
      { value: "mega_ads_left", label: "Mega Ads Left" },
      { value: "mega_ads_right", label: "Mega Ads Right" },
      { value: "scrolling_ads", label: "Scrolling Ads" }
    ],
    legacy: [{ value: "public_ads", label: "Public Ads" }],
    featured: [
      { value: "featured_mega", label: "Featured Mega" },
      { value: "featured_scroll", label: "Featured Scroll" }
    ]
  };

  // Load ad if in edit mode
  useEffect(() => {
    if (mode === "edit") {
      api.get(`/admin/ads/${id}`)
        .then((res) => res.data)
        .then(ad => {
          const payload = ad?.data || ad;
          setTitle(payload.title || payload.name || "");
          setTargetUrl(payload.link || payload.targetUrl || "");
          setPrice(String(payload.price ?? ""));
          const nextSourceType = ["cms", "legacy", "featured"].includes(payload.sourceType)
            ? payload.sourceType
            : "cms";
          setSourceType(nextSourceType);
          if (payload.sourceType === "featured" && (payload.placement === "mega" || payload.placement === "scroll")) {
            setPlacement(payload.placement === "scroll" ? "featured_scroll" : "featured_mega");
          } else {
            setPlacement(payload.placement || "checkout_ads");
          }
          setActive(Object.prototype.hasOwnProperty.call(payload, "active") ? Boolean(payload.active) : true);
          setText(payload.text || "");
          const imageUrl = payload.imageUrl || payload.image_url || payload.image || payload.url || payload.src;
          if (imageUrl) {
            setPreview(imageUrl);
          }
        })
        .catch(err => console.error("Failed loading ad:", err));
    }
  }, [mode, id]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    console.log("[AdminAdForm] saving ad", {
      mode,
      id,
      title,
      targetUrl,
      placement,
      sourceType,
      active,
      price,
      hasImage: Boolean(image),
      hasPreview: Boolean(preview)
    });

    try {
      const imageUrl = image ? await readImageAsDataUrl(image) : preview;
      const payload = {
        title,
        name: title,
        link: targetUrl,
        targetUrl,
        sourceType,
        placement,
        active,
        text,
        price: Number(price || 0),
        imageUrl
      };

      if (mode === "edit") {
        await api.put(`/admin/ads/${id}`, payload);
      } else {
        await api.post("/admin/ads", payload);
      }
      navigate("/admin/ads");
    } catch (err) {
      console.error("[AdminAdForm] save failed", err?.response?.data || err);
      const message =
        (typeof err?.response?.data?.message === "string" ? err.response.data.message : "") ||
        (typeof err?.response?.data?.error === "string" ? err.response.data.error : "") ||
        (err?.response?.data ? JSON.stringify(err.response.data) : "") ||
        err?.message ||
        "Failed to save advertisement";
      setErrorMessage(message);
      alert(message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl mb-5">
        {mode === "edit" ? "Edit Advertisement" : "Create New Advertisement"}
      </h1>

      {errorMessage ? (
        <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: "#fee2e2", color: "#991b1b" }}>
          {errorMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-96">
        <input
          type="text"
          placeholder="Ad Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2"
          required
        />

        <input
          type="text"
          placeholder="Link (https://...)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="border p-2"
          required
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2"
          min="0"
          step="0.01"
          required
        />

        <textarea
          placeholder="Optional helper text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border p-2 min-h-24"
        />

        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="border p-2"
          disabled={isEditing}
        >
          <option value="cms">CMS Advertisement</option>
          <option value="legacy">Legacy/Public Advertisement</option>
          <option value="featured">Featured Advertisement</option>
        </select>

        <select
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
          className="border p-2"
        >
          {(placementOptions[sourceType] || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {isEditing ? (
          <div className="text-xs text-gray-500">
            Source type stays locked while editing so the existing ad record remains connected to the live placement.
          </div>
        ) : null}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Active
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const nextFile = e.target.files?.[0];
            setImage(nextFile || null);
            if (nextFile) {
              setPreview(URL.createObjectURL(nextFile));
            }
          }}
          className="border p-2"
        />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-60 rounded shadow"
          />
        )}

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          {mode === "edit" ? "Update Ad" : "Create Ad"}
        </button>
      </form>
    </div>
  );
};

export default AdminAdForm;



