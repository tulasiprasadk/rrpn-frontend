import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config/api";
import imageCompression from "browser-image-compression";

export default function SupplierKYC() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: email,
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
      navigate("/supplier/login");
    }
  }, [email, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) {
      setError("Please upload an image (JPG, PNG) or PDF file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    try {
      // Compress image if it's an image file
      let processedFile = file;
      if (file.type.startsWith("image/")) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        processedFile = await imageCompression(file, options);
      }

      setFiles((prev) => ({ ...prev, [field]: processedFile }));

      // Create preview for images
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
      console.error("File processing error:", err);
      setError("Failed to process file. Please try again.");
    }
  };

  const removeFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setPreviews((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    if (!formData.businessName.trim()) {
      setError("Business name is required");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!formData.address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!formData.gstNumber.trim()) {
      setError("GST number is required");
      return false;
    }
    if (!formData.panNumber.trim()) {
      setError("PAN number is required");
      return false;
    }
    if (!formData.bankAccountNumber.trim()) {
      setError("Bank account number is required");
      return false;
    }
    if (!formData.bankIFSC.trim()) {
      setError("Bank IFSC code is required");
      return false;
    }
    if (!formData.bankName.trim()) {
      setError("Bank name is required");
      return false;
    }
    if (!formData.acceptedTnC) {
      setError("You must accept the Terms & Conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();

      // Add form fields
      form.append("email", formData.email);
      form.append("businessName", formData.businessName);
      form.append("phone", formData.phone);
      form.append("address", formData.address);
      form.append("gstNumber", formData.gstNumber);
      form.append("panNumber", formData.panNumber);
      form.append("acceptedTnC", formData.acceptedTnC ? "true" : "false");

      // Add bank details as JSON
      const bankDetails = {
        accountNumber: formData.bankAccountNumber,
        ifsc: formData.bankIFSC,
        bankName: formData.bankName,
      };
      form.append("bankDetails", JSON.stringify(bankDetails));

      // Add files
      if (files.businessLicense) {
        form.append("businessLicense", files.businessLicense);
      }
      if (files.gstCertificate) {
        form.append("gstCertificate", files.gstCertificate);
      }
      if (files.idProof) {
        form.append("idProof", files.idProof);
      }

      const response = await axios.post(`${API_BASE}/suppliers/kyc`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess("KYC submitted successfully! Waiting for admin approval.");
        setTimeout(() => {
          navigate("/supplier/login?kyc_submitted=1");
        }, 2000);
      }
    } catch (err) {
      console.error("KYC submission error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Failed to submit KYC. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ marginBottom: "8px" }}>Complete Your KYC</h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Please provide your business details and documents to complete the
        verification process.
      </p>

      {error && (
        <div
          style={{
            padding: "12px",
            background: "#ffebee",
            color: "#c62828",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "12px",
            background: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Business Information */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Business Information
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              Business Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              placeholder="Enter your business name"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              Phone Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              Business Address <span style={{ color: "red" }}>*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
                resize: "vertical",
              }}
              placeholder="Enter your complete business address"
            />
          </div>
        </div>

        {/* Tax Information */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Tax Information
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              GST Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              placeholder="Enter GST number"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              PAN Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              placeholder="Enter PAN number"
            />
          </div>
        </div>

        {/* Bank Details */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Bank Details
          </h2>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              Account Number <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              name="bankAccountNumber"
              value={formData.bankAccountNumber}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              placeholder="Enter bank account number"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
                IFSC Code <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="bankIFSC"
                value={formData.bankIFSC}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="Enter IFSC code"
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
                Bank Name <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
                placeholder="Enter bank name"
              />
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>
            Required Documents
          </h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "16px" }}>
            Upload clear images or PDFs (Max 5MB each)
          </p>

          {/* Business License */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              Business License
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange("businessLicense", e)}
              style={{ marginBottom: "8px" }}
            />
            {previews.businessLicense && (
              <div style={{ marginTop: "8px" }}>
                {previews.businessLicense !== "pdf" ? (
                  <img
                    src={previews.businessLicense}
                    alt="Business License Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div style={{ padding: "8px", background: "#f5f5f5", borderRadius: "4px" }}>
                    PDF uploaded
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile("businessLicense")}
                  style={{
                    marginLeft: "8px",
                    padding: "4px 8px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* GST Certificate */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              GST Certificate
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange("gstCertificate", e)}
              style={{ marginBottom: "8px" }}
            />
            {previews.gstCertificate && (
              <div style={{ marginTop: "8px" }}>
                {previews.gstCertificate !== "pdf" ? (
                  <img
                    src={previews.gstCertificate}
                    alt="GST Certificate Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div style={{ padding: "8px", background: "#f5f5f5", borderRadius: "4px" }}>
                    PDF uploaded
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile("gstCertificate")}
                  style={{
                    marginLeft: "8px",
                    padding: "4px 8px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* ID Proof */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
              ID Proof (Aadhaar/PAN/Driving License)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange("idProof", e)}
              style={{ marginBottom: "8px" }}
            />
            {previews.idProof && (
              <div style={{ marginTop: "8px" }}>
                {previews.idProof !== "pdf" ? (
                  <img
                    src={previews.idProof}
                    alt="ID Proof Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <div style={{ padding: "8px", background: "#f5f5f5", borderRadius: "4px" }}>
                    PDF uploaded
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeFile("idProof")}
                  style={{
                    marginLeft: "8px",
                    padding: "4px 8px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "flex", alignItems: "flex-start", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="acceptedTnC"
              checked={formData.acceptedTnC}
              onChange={handleInputChange}
              required
              style={{ marginRight: "8px", marginTop: "4px" }}
            />
            <span>
              I accept the{" "}
              <a href="/terms" target="_blank" style={{ color: "#1976d2" }}>
                Terms & Conditions
              </a>{" "}
              <span style={{ color: "red" }}>*</span>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>
    </div>
  );
}
