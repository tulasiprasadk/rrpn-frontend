import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { API_BASE } from "../config/api";

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #d8d8d8",
  borderRadius: "10px",
  fontSize: "15px",
  background: "#fff",
  color: "#1f2937",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: 600,
  color: "#7f1d1d",
};

const sectionStyle = {
  background: "#fff",
  border: "1px solid #f1d58a",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "20px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
};

export default function SupplierKYC() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email,
    businessName: "",
    phone: "",
    address: "",
    gstNumber: "",
    panNumber: "",
    bankAccountNumber: "",
    bankIFSC: "",
    bankName: "",
    acceptedTnC: false,
  });

  const [files, setFiles] = useState({
    businessLicense: null,
    gstCertificate: null,
    idProof: null,
  });

  const [previews, setPreviews] = useState({
    businessLicense: null,
    gstCertificate: null,
    idProof: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!email) {
      navigate("/supplier/login", { replace: true });
    }
  }, [email, navigate]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (field, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      setError("Please upload a JPG, PNG, or PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
      return;
    }

    try {
      let processedFile = file;
      if (file.type.startsWith("image/")) {
        processedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      }

      setFiles((prev) => ({ ...prev, [field]: processedFile }));

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({ ...prev, [field]: reader.result }));
        };
        reader.readAsDataURL(processedFile);
      } else {
        setPreviews((prev) => ({ ...prev, [field]: "pdf" }));
      }
    } catch (err) {
      setError("Could not process the file. Please try again.");
    }
  };

  const removeFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) return "Business name is required.";
    if (!formData.phone.trim()) return "Phone number is required.";
    if (!formData.address.trim()) return "Address is required.";
    if (!formData.gstNumber.trim()) return "GST number is required.";
    if (!formData.panNumber.trim()) return "PAN number is required.";
    if (!formData.bankAccountNumber.trim()) return "Bank account number is required.";
    if (!formData.bankIFSC.trim()) return "Bank IFSC code is required.";
    if (!formData.bankName.trim()) return "Bank name is required.";
    if (!formData.acceptedTnC) return "You must accept the Terms & Conditions.";
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("email", formData.email);
      form.append("businessName", formData.businessName);
      form.append("phone", formData.phone);
      form.append("address", formData.address);
      form.append("gstNumber", formData.gstNumber);
      form.append("panNumber", formData.panNumber);
      form.append("acceptedTnC", formData.acceptedTnC ? "true" : "false");
      form.append(
        "bankDetails",
        JSON.stringify({
          accountNumber: formData.bankAccountNumber,
          ifsc: formData.bankIFSC,
          bankName: formData.bankName,
        })
      );

      if (files.businessLicense) form.append("businessLicense", files.businessLicense);
      if (files.gstCertificate) form.append("gstCertificate", files.gstCertificate);
      if (files.idProof) form.append("idProof", files.idProof);

      const response = await axios.post(`${API_BASE}/suppliers/kyc`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess("KYC submitted successfully. Waiting for admin approval.");
        setTimeout(() => {
          navigate("/supplier/login?kyc_submitted=1", {
            replace: true,
            state: {
              email: formData.email,
              businessName: formData.businessName,
            },
          });
        }, 1800);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to submit KYC. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderUploadPreview = (field, title) => {
    if (!previews[field]) return null;

    return (
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {previews[field] !== "pdf" ? (
          <img
            src={previews[field]}
            alt={`${title} preview`}
            style={{
              maxWidth: "180px",
              maxHeight: "180px",
              border: "1px solid #ddd",
              borderRadius: "10px",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{ padding: "10px 12px", borderRadius: "10px", background: "#f5f5f5", color: "#444" }}>
            PDF uploaded
          </div>
        )}
        <button
          type="button"
          onClick={() => removeFile(field)}
          style={{
            padding: "8px 12px",
            background: "#dc2626",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Remove
        </button>
      </div>
    );
  };

  if (!email) {
    return <div style={{ padding: 24 }}>Redirecting to supplier login...</div>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff7cc 0%, #fffdf5 50%, #ffffff 100%)",
        padding: "32px 16px 64px",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #ffe082, #fff3bf)",
            border: "1px solid #f0cf72",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 12px 28px rgba(0,0,0,0.07)",
          }}
        >
          <h1 style={{ margin: 0, color: "#7f1d1d", fontSize: "32px" }}>Supplier KYC</h1>
          <p style={{ margin: "10px 0 0", color: "#5b5b5b", fontSize: "16px" }}>
            Login is successful. Complete your supplier verification to unlock the dashboard.
          </p>
          <div
            style={{
              marginTop: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px",
              background: "#fff",
              borderRadius: "999px",
              border: "1px solid #f1d58a",
              color: "#374151",
              fontWeight: 600,
            }}
          >
            Google account: {email}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "12px 14px",
              background: "#fff1f2",
              color: "#b42318",
              border: "1px solid #fda4af",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "12px 14px",
              background: "#ecfdf3",
              color: "#027a48",
              border: "1px solid #86efac",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={sectionStyle}>
            <h2 style={{ marginTop: 0, color: "#7f1d1d" }}>Business Information</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>Business Name *</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter your business name"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Business Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter your complete business address"
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={{ marginTop: 0, color: "#7f1d1d" }}>Tax Information</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>GST Number *</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="Enter GST number"
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>PAN Number *</label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  placeholder="Enter PAN number"
                  style={fieldStyle}
                />
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={{ marginTop: 0, color: "#7f1d1d" }}>Bank Details</h2>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={labelStyle}>Account Number *</label>
                <input
                  type="text"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter bank account number"
                  style={fieldStyle}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div>
                  <label style={labelStyle}>IFSC Code *</label>
                  <input
                    type="text"
                    name="bankIFSC"
                    value={formData.bankIFSC}
                    onChange={handleInputChange}
                    placeholder="Enter IFSC code"
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter bank name"
                    style={fieldStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={{ marginTop: 0, color: "#7f1d1d" }}>Required Documents</h2>
            <p style={{ color: "#666", marginTop: 0 }}>
              Upload clear JPG, PNG, or PDF documents. Maximum 5MB each.
            </p>

            <div style={{ display: "grid", gap: 18 }}>
              <div>
                <label style={labelStyle}>Business License</label>
                <input type="file" accept="image/*,.pdf" onChange={(event) => handleFileChange("businessLicense", event)} />
                {renderUploadPreview("businessLicense", "Business License")}
              </div>

              <div>
                <label style={labelStyle}>GST Certificate</label>
                <input type="file" accept="image/*,.pdf" onChange={(event) => handleFileChange("gstCertificate", event)} />
                {renderUploadPreview("gstCertificate", "GST Certificate")}
              </div>

              <div>
                <label style={labelStyle}>ID Proof</label>
                <input type="file" accept="image/*,.pdf" onChange={(event) => handleFileChange("idProof", event)} />
                {renderUploadPreview("idProof", "ID Proof")}
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#374151", lineHeight: 1.5 }}>
              <input
                type="checkbox"
                name="acceptedTnC"
                checked={formData.acceptedTnC}
                onChange={handleInputChange}
                style={{ marginTop: 4 }}
              />
              <span>
                I accept the <a href="/terms" target="_blank" rel="noreferrer" style={{ color: "#1976d2" }}>Terms & Conditions</a> *
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#9ca3af" : "linear-gradient(135deg, #c8102e, #e11d48)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 10px 24px rgba(200,16,46,0.22)",
            }}
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </button>
        </form>
      </div>
    </div>
  );
}
