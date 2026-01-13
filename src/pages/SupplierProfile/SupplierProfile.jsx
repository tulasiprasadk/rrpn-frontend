import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierSidebar from "../../components/dashboard/SupplierSidebar";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import "../../components/dashboard/Sidebar.css";

export default function SupplierProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/supplier/auth/me");
      if (res.data.loggedIn) {
        setProfile(res.data.supplier);
      } else {
        navigate("/supplier/login");
      }
    } catch (err) {
      console.error("Profile load error:", err);
      if (err.response?.status === 401) {
        navigate("/supplier/login");
        return;
      }
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '80vh', background: '#f8f9fa', position: 'relative' }}>
      <SupplierSidebar />
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        maxWidth: 'calc(100vw - 250px)',
        boxSizing: 'border-box',
        minWidth: 0,
        position: 'relative'
      }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '28px', fontWeight: 'bold' }}>My Profile</h1>

        {error && (
          <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading profile...</div>
        ) : !profile ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>👤</div>
            <h2 style={{ color: '#666', marginBottom: '0.5rem' }}>No Profile Data</h2>
            <p style={{ color: '#999' }}>Unable to load profile information. Please try again later.</p>
          </div>
        ) : (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ 
                width: '100px', 
                height: '100px', 
                borderRadius: '50%', 
                background: '#e0e0e0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: '1rem'
              }}>
                {profile.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '24px' }}>{profile.name || 'Supplier'}</h2>
              <p style={{ margin: 0, color: '#666' }}>{profile.email}</p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Business Information</h3>
                <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
                  <p style={{ margin: '0.5rem 0' }}><strong>Business Name:</strong> {profile.businessName || 'Not provided'}</p>
                  <p style={{ margin: '0.5rem 0' }}><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
                  <p style={{ margin: '0.5rem 0' }}><strong>Address:</strong> {profile.address || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Tax Information</h3>
                <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
                  <p style={{ margin: '0.5rem 0' }}><strong>GST Number:</strong> {profile.gstNumber || 'Not provided'}</p>
                  <p style={{ margin: '0.5rem 0' }}><strong>PAN Number:</strong> {profile.panNumber || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: '0.5rem', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>Account Status</h3>
                <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Status:</strong> <span style={{ 
                      color: profile.status === 'approved' ? '#4caf50' : profile.status === 'rejected' ? '#f44336' : '#ff9800',
                      fontWeight: '600'
                    }}>{profile.status || 'pending'}</span>
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>KYC Submitted:</strong> {profile.kycSubmitted ? 'Yes' : 'No'}
                  </p>
                  {profile.kycSubmittedAt && (
                    <p style={{ margin: '0.5rem 0' }}>
                      <strong>KYC Submitted At:</strong> {new Date(profile.kycSubmittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
