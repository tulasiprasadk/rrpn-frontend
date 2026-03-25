import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, BACKEND_BASE } from "../../config/api";
import "./AdminKycApproval.css";

export default function AdminKycApproval() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchAdminJson(path, options = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      ...options,
      headers,
    });

    const raw = await response.text();
    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = raw;
    }

    if (!response.ok) {
      const error = new Error("Request failed");
      error.response = { status: response.status, data };
      throw error;
    }

    return data;
  }

  async function fetchSuppliers() {
    try {
      setLoading(true);
      const data = await fetchAdminJson("/admin/suppliers");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.suppliers)
          ? data.suppliers
          : Array.isArray(data?.data)
            ? data.data
          : [];
      setSuppliers(list);
      setError("");
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setError("You do not have permission to view suppliers.");
      } else {
        setError("Failed to load suppliers");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(supplierId) {
    if (!confirm("Are you sure you want to approve this supplier?")) return;

    try {
      setActionLoading(true);
      await fetchAdminJson(`/admin/suppliers/${supplierId}/approve`, {
        method: "POST",
      });
      alert("Supplier approved successfully!");
      setSelectedSupplier(null);
      setRejectionReason("");
      fetchSuppliers();
    } catch (err) {
      console.error("Error approving supplier:", err);
      alert(err?.response?.data?.error || "Failed to approve supplier");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(supplierId) {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    if (!confirm("Are you sure you want to reject this supplier?")) return;

    try {
      setActionLoading(true);
      await fetchAdminJson(`/admin/suppliers/${supplierId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      });
      alert("Supplier rejected successfully!");
      setSelectedSupplier(null);
      setRejectionReason("");
      fetchSuppliers();
    } catch (err) {
      console.error("Error rejecting supplier:", err);
      alert(err?.response?.data?.error || "Failed to reject supplier");
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const sections = useMemo(() => {
    const grouped = {
      pendingApproval: suppliers.filter((supplier) => supplier?.status === "kyc_submitted"),
      awaitingKyc: suppliers.filter((supplier) => supplier?.status === "kyc_pending" || supplier?.status === "pending"),
      approved: suppliers.filter((supplier) => supplier?.status === "approved"),
      rejected: suppliers.filter((supplier) => supplier?.status === "rejected"),
    };

    return [
      {
        key: "pendingApproval",
        title: "Pending Approval",
        empty: "No suppliers are waiting for approval.",
        suppliers: grouped.pendingApproval,
        badgeClass: "status-pending",
        badgeText: "Pending Approval",
        canReview: true,
      },
      {
        key: "awaitingKyc",
        title: "Awaiting KYC Submission",
        empty: "No suppliers are waiting to submit KYC.",
        suppliers: grouped.awaitingKyc,
        badgeClass: "status-awaiting",
        badgeText: "Awaiting KYC",
        canReview: false,
      },
      {
        key: "approved",
        title: "Approved Suppliers",
        empty: "No approved suppliers found.",
        suppliers: grouped.approved,
        badgeClass: "status-approved",
        badgeText: "Approved",
        canReview: false,
      },
      {
        key: "rejected",
        title: "Rejected Suppliers",
        empty: "No rejected suppliers found.",
        suppliers: grouped.rejected,
        badgeClass: "status-rejected",
        badgeText: "Rejected",
        canReview: true,
      },
    ];
  }, [suppliers]);

  const summary = {
    pendingApproval: sections[0].suppliers.length,
    awaitingKyc: sections[1].suppliers.length,
    approved: sections[2].suppliers.length,
    rejected: sections[3].suppliers.length,
  };

  if (loading) {
    return (
      <div className="kyc-approval-container">
        <h1>KYC Approval</h1>
        <div className="loading">Loading suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kyc-approval-container">
        <h1>KYC Approval</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="kyc-approval-container">
      <h1>KYC Approval Dashboard</h1>
      <p className="subtitle">Review supplier registrations and current status</p>

      <div className="kyc-summary-grid">
        <div className="summary-card">
          <strong>{summary.pendingApproval}</strong>
          <span>Pending Approval</span>
        </div>
        <div className="summary-card">
          <strong>{summary.awaitingKyc}</strong>
          <span>Awaiting KYC</span>
        </div>
        <div className="summary-card">
          <strong>{summary.approved}</strong>
          <span>Approved</span>
        </div>
        <div className="summary-card">
          <strong>{summary.rejected}</strong>
          <span>Rejected</span>
        </div>
      </div>

      {sections.map((section) => (
        <section key={section.key} className="kyc-section">
          <div className="kyc-section-header">
            <h2>{section.title}</h2>
            <span className="kyc-section-count">{section.suppliers.length}</span>
          </div>

          {section.suppliers.length === 0 ? (
            <div className="empty-state compact-empty">
              <h3>{section.title}</h3>
              <p>{section.empty}</p>
            </div>
          ) : (
            <div className="suppliers-grid">
              {section.suppliers.map((supplier) => (
                <div key={supplier.id} className="supplier-card">
                  <div className="card-header">
                    <h3>{supplier.name}</h3>
                    <span className={`status-badge ${section.badgeClass}`}>{section.badgeText}</span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <strong>Business Name:</strong>
                      <span>{supplier.businessName || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <strong>Phone:</strong>
                      <span>{supplier.phone || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <strong>Email:</strong>
                      <span>{supplier.email || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <strong>GST Number:</strong>
                      <span>{supplier.gstNumber || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <strong>PAN Number:</strong>
                      <span>{supplier.panNumber || "N/A"}</span>
                    </div>

                    <div className="info-row">
                      <strong>Registered:</strong>
                      <span>{formatDate(supplier.createdAt)}</span>
                    </div>

                    <div className="info-row">
                      <strong>Address:</strong>
                      <span>{supplier.address || "N/A"}</span>
                    </div>

                    {supplier.rejectionReason && (
                      <div className="info-section rejection-note">
                        <strong>Rejection Reason:</strong>
                        <div className="bank-details">
                          <span>{supplier.rejectionReason}</span>
                        </div>
                      </div>
                    )}

                    {supplier.bankDetails && (
                      <div className="info-section">
                        <strong>Bank Details:</strong>
                        <div className="bank-details">
                          <span>Bank: {supplier.bankDetails.bankName || "N/A"}</span>
                          <span>A/C: {supplier.bankDetails.accountNumber || "N/A"}</span>
                          <span>IFSC: {supplier.bankDetails.ifsc || "N/A"}</span>
                        </div>
                      </div>
                    )}

                    <div className="documents-section">
                      <strong>KYC Documents:</strong>
                      <div className="documents-grid">
                        {supplier.businessLicense && (
                          <a
                            href={`${BACKEND_BASE}/${supplier.businessLicense}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            Business License
                          </a>
                        )}
                        {supplier.gstCertificate && (
                          <a
                            href={`${BACKEND_BASE}/${supplier.gstCertificate}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            GST Certificate
                          </a>
                        )}
                        {supplier.idProof && (
                          <a
                            href={`${BACKEND_BASE}/${supplier.idProof}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="document-link"
                          >
                            ID Proof
                          </a>
                        )}
                        {!supplier.businessLicense && !supplier.gstCertificate && !supplier.idProof && (
                          <span className="no-docs">No documents uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="btn btn-view"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setRejectionReason(supplier.rejectionReason || "");
                      }}
                    >
                      {section.canReview ? "Review Details" : "View Details"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      {selectedSupplier && (
        <div className="modal-overlay" onClick={() => setSelectedSupplier(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedSupplier(null)}>
              x
            </button>

            <h2>Review Supplier Application</h2>
            <h3>{selectedSupplier.name}</h3>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <p><strong>Business Name:</strong> {selectedSupplier.businessName || "N/A"}</p>
                <p><strong>Phone:</strong> {selectedSupplier.phone || "N/A"}</p>
                <p><strong>Email:</strong> {selectedSupplier.email || "N/A"}</p>
                <p><strong>Address:</strong> {selectedSupplier.address || "N/A"}</p>
                <p><strong>Status:</strong> {selectedSupplier.status || "N/A"}</p>
              </div>

              <div className="detail-section">
                <h4>Business Details</h4>
                <p><strong>GST Number:</strong> {selectedSupplier.gstNumber || "N/A"}</p>
                <p><strong>PAN Number:</strong> {selectedSupplier.panNumber || "N/A"}</p>
                <p><strong>Registered:</strong> {formatDate(selectedSupplier.createdAt)}</p>
              </div>

              {selectedSupplier.bankDetails && (
                <div className="detail-section">
                  <h4>Bank Details</h4>
                  <p><strong>Bank Name:</strong> {selectedSupplier.bankDetails.bankName || "N/A"}</p>
                  <p><strong>Account Number:</strong> {selectedSupplier.bankDetails.accountNumber || "N/A"}</p>
                  <p><strong>IFSC Code:</strong> {selectedSupplier.bankDetails.ifsc || "N/A"}</p>
                </div>
              )}

              <div className="detail-section">
                <h4>KYC Documents</h4>
                <div className="documents-preview">
                  {selectedSupplier.businessLicense && (
                    <div className="doc-preview">
                      <strong>Business License</strong>
                      <a
                        href={`${BACKEND_BASE}/${selectedSupplier.businessLicense}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-link"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {selectedSupplier.gstCertificate && (
                    <div className="doc-preview">
                      <strong>GST Certificate</strong>
                      <a
                        href={`${BACKEND_BASE}/${selectedSupplier.gstCertificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-link"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {selectedSupplier.idProof && (
                    <div className="doc-preview">
                      <strong>ID Proof</strong>
                      <a
                        href={`${BACKEND_BASE}/${selectedSupplier.idProof}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="preview-link"
                      >
                        View Document
                      </a>
                    </div>
                  )}
                  {!selectedSupplier.businessLicense && !selectedSupplier.gstCertificate && !selectedSupplier.idProof && (
                    <span className="no-docs">No documents uploaded</span>
                  )}
                </div>
              </div>

              <div className="action-section">
                <h4>Take Action</h4>

                {selectedSupplier.status === "kyc_submitted" ? (
                  <>
                    <button
                      className="btn btn-approve"
                      onClick={() => handleApprove(selectedSupplier.id)}
                      disabled={actionLoading}
                    >
                      Approve Supplier
                    </button>

                    <div className="reject-section">
                      <textarea
                        placeholder="Reason for rejection (required)"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows="3"
                        className="rejection-textarea"
                      />
                      <button
                        className="btn btn-reject"
                        onClick={() => handleReject(selectedSupplier.id)}
                        disabled={actionLoading || !rejectionReason.trim()}
                      >
                        Reject Supplier
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="info-section">
                    <strong>Current Status:</strong>
                    <div className="bank-details">
                      <span>{selectedSupplier.status || "N/A"}</span>
                      {selectedSupplier.status === "rejected" && selectedSupplier.rejectionReason ? (
                        <span>Reason: {selectedSupplier.rejectionReason}</span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
