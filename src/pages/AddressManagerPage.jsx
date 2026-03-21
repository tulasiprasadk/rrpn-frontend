import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../api/client";
import GoogleAddressInput from "../components/GoogleAddressInput";
import "./AddressManagerPage.css";

export default function AddressManagerPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state || {};

  const [form, setForm] = useState({
    name: address.name || "",
    phone: address.phone || "",
    pincode: address.pincode || "",
    addressLine: address.addressLine || "",
    city: address.city || "",
    state: address.state || "",
    isDefault: address.isDefault || false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleGoogleSelect = (place) => {
    if (!place.address_components) return;

    const find = (type) =>
      place.address_components.find((component) => component.types.includes(type))?.long_name || "";

    const street = `${find("street_number")} ${find("route")}`.trim();

    setForm((prev) => ({
      ...prev,
      addressLine: street || prev.addressLine,
      city: find("locality") || find("sublocality_level_1") || prev.city,
      state: find("administrative_area_level_1") || prev.state,
      pincode: find("postal_code") || prev.pincode,
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setError("");

      if (!form.name || !form.phone || !form.addressLine || !form.city) {
        setError("Please fill in all required fields: name, phone, address, and city.");
        setSaving(false);
        return;
      }

      let response;
      let savedAddressId = address.id || null;

      if (address.id) {
        response = await api.put(`/customer/address/${address.id}`, form);
      } else {
        response = await api.post("/customer/address", form);
        savedAddressId = response.data?.address?.id || response.data?.id || null;
      }

      if (form.isDefault && savedAddressId) {
        await api.put(`/customer/address/${savedAddressId}/default`);
      }

      if (!address.id && response.data?.address) {
        setForm((prev) => ({ ...prev, ...response.data.address }));
      }

      navigate("/address");
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Please log in first.");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to save address.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="address-manager-page">
      <div className="address-manager-card">
        <div className="address-manager-header">
          <h2>{address.id ? "Edit Address" : "Add Address"}</h2>
          <p>Keep your delivery details saved so checkout stays fast.</p>
        </div>

        {error && <div className="address-manager-error">{error}</div>}

        <div className="address-form-grid">
          <div className="address-form-field address-form-field-full">
            <label htmlFor="addressLine">Search Address</label>
            <GoogleAddressInput
              value={form.addressLine}
              onChange={(value) => setForm((prev) => ({ ...prev, addressLine: value }))}
              onSelect={handleGoogleSelect}
            />
          </div>

          <div className="address-form-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          </div>

          <div className="address-form-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} />
          </div>

          <div className="address-form-field address-form-field-full">
            <label htmlFor="addressLineManual">Address Line</label>
            <input
              id="addressLineManual"
              name="addressLine"
              placeholder="House, street, area"
              value={form.addressLine}
              onChange={handleChange}
            />
          </div>

          <div className="address-form-field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" placeholder="City" value={form.city} onChange={handleChange} />
          </div>

          <div className="address-form-field">
            <label htmlFor="state">State</label>
            <input id="state" name="state" placeholder="State" value={form.state} onChange={handleChange} />
          </div>

          <div className="address-form-field">
            <label htmlFor="pincode">Pincode</label>
            <input id="pincode" name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} />
          </div>
        </div>

        <label className="address-manager-default">
          <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
          <span>Set as default address</span>
        </label>

        <div className="address-manager-actions">
          <button onClick={save} disabled={saving} className="address-primary-btn">
            {saving ? "Saving..." : "Save Address"}
          </button>
          <button onClick={() => navigate("/address")} className="address-secondary-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
