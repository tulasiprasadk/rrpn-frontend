import { useEffect, useState } from "react";
import { API_BASE } from "../../config/api";
import "./AdminManagement.css";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    autoApprove: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const [allRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE}/admin/admins`, { credentials: 'include' }),
        fetch(`${API_BASE}/admin/admins/pending`, { credentials: 'include' })
      ]);

      if (allRes.ok) {
        const allData = await allRes.json();
        setAdmins(allData);
      }

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingAdmins(pendingData);
      }
    } catch (err) {
      console.error("Failed to load admins:", err);
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/admin/admins`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(data.message || "Admin created successfully!");
        setFormData({ name: "", email: "", password: "", role: "admin", autoApprove: false });
        setShowForm(false);
        loadAdmins();
      } else {
        setError(data.error || "Failed to create admin");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this admin?")) return;

    try {
      const res = await fetch(`${API_BASE}/admin/admins/${id}/approve-admin`, {
        method: "POST",
        credentials: 'include',
      });

      if (res.ok) {
        setSuccess("Admin approved successfully!");
        loadAdmins();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to approve admin");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  const handleDeactivate = async (id, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    if (!window.confirm(`${action === 'deactivate' ? 'Deactivate' : 'Activate'} this admin?`)) return;

    try {
      const res = await fetch(`${API_BASE}/admin/admins/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setSuccess(`Admin ${action === 'deactivate' ? 'deactivated' : 'activated'} successfully!`);
        loadAdmins();
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${action} admin`);
      }
    } catch (err) {
      setError("Network error: " + err.message);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading admins...</div>;
  }

  return (
    <div className="admin-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Admin Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          {showForm ? "Cancel" : "+ Add New Admin"}
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee', color: '#c33', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#efe', color: '#3c3', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          {success}
        </div>
      )}

      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '16px' }}>Create New Admin</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={formData.autoApprove}
                onChange={(e) => setFormData({ ...formData, autoApprove: e.target.checked })}
              />
              <label>Auto-approve (admin can login immediately)</label>
            </div>

            <button
              type="submit"
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                marginTop: '8px'
              }}
            >
              Create Admin
            </button>
          </form>
        </div>
      )}

      {pendingAdmins.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '16px', color: '#ff9800' }}>Pending Approval ({pendingAdmins.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{admin.name}</td>
                  <td style={{ padding: '12px' }}>{admin.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: admin.role === 'super_admin' ? '#dc3545' : admin.role === 'admin' ? '#007bff' : '#6c757d',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {admin.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleApprove(admin.id)}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '16px' }}>All Admins ({admins.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Last Login</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{admin.name}</td>
                <td style={{ padding: '12px' }}>{admin.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: admin.role === 'super_admin' ? '#dc3545' : admin.role === 'admin' ? '#007bff' : '#6c757d',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {admin.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: admin.isApproved && admin.isActive ? '#28a745' : '#ffc107',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {admin.isApproved && admin.isActive ? 'Active' : admin.isApproved ? 'Inactive' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td style={{ padding: '12px' }}>
                  {!admin.isApproved && (
                    <button
                      onClick={() => handleApprove(admin.id)}
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginRight: '8px'
                      }}
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDeactivate(admin.id, admin.isActive)}
                    style={{
                      background: admin.isActive ? '#dc3545' : '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    {admin.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminManagement;
