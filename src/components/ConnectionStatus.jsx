// Connection Status Indicator Component
import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config/api';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'
  const [lastCheck, setLastCheck] = useState(null);

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${API_BASE}/health`, {
        signal: controller.signal,
        credentials: 'include',
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
      setLastCheck(new Date());
    } catch (err) {
      setStatus('disconnected');
      setLastCheck(new Date());
    }
  }

  // Only show in development or when disconnected
  if (import.meta.env.PROD && status === 'connected') {
    return null;
  }

  const statusColors = {
    checking: '#ff9800',
    connected: '#4caf50',
    disconnected: '#f44336',
  };

  const statusText = {
    checking: 'Checking...',
    connected: 'Connected',
    disconnected: 'Disconnected',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '8px 16px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        zIndex: 9999,
        cursor: 'pointer',
      }}
      onClick={checkConnection}
      title="Click to check connection"
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: statusColors[status],
          animation: status === 'checking' ? 'pulse 1.5s ease-in-out infinite' : 'none',
        }}
      />
      <span style={{ color: '#333' }}>{statusText[status]}</span>
      {lastCheck && (
        <span style={{ color: '#999', fontSize: '10px' }}>
          {new Date(lastCheck).toLocaleTimeString()}
        </span>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
