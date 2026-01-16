import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import axios from 'axios';
import './PlatformConfig.css';

export default function PlatformConfig() {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Default config structure
  const configStructure = {
    fees: {
      title: 'Platform Fees & Margins',
      fields: [
        { key: 'platform_commission', label: 'Supplier Margin (%)', type: 'number', default: 15, min: 0, max: 100, description: 'Percentage margin charged on each order (default 15%)' },
        { key: 'platform_fee', label: 'Platform Fee (₹)', type: 'number', default: 0, min: 0, description: 'Fixed platform fee per order' },
        { key: 'delivery_fee', label: 'Delivery Fee (₹)', type: 'number', default: 0, min: 0, description: 'Fixed delivery fee per order' },
        { key: 'transport_fee', label: 'Transportation Fee (₹)', type: 'number', default: 0, min: 0, description: 'Fixed transportation fee per order' },
        { key: 'min_order_amount', label: 'Minimum Order Amount (₹)', type: 'number', default: 0, min: 0, description: 'Minimum order value required' }
      ]
    },
    delivery: {
      title: 'Delivery Charges Configuration',
      fields: [
        { key: 'delivery_model', label: 'Delivery Model', type: 'string', default: 'flat', description: 'Options: flat, distance, weight, zone, combined, free_threshold' },
        { key: 'delivery_fee', label: 'Flat Delivery Fee (₹)', type: 'number', default: 0, min: 0, description: 'Flat rate delivery charge (used for flat model)' },
        { key: 'delivery_base_fee', label: 'Base Delivery Fee (₹)', type: 'number', default: 0, min: 0, description: 'Base fee for distance/weight/combined models' },
        { key: 'delivery_per_km', label: 'Per Kilometer Rate (₹)', type: 'number', default: 0, min: 0, description: 'Charge per km for distance-based model' },
        { key: 'delivery_per_kg', label: 'Per Kilogram Rate (₹)', type: 'number', default: 0, min: 0, description: 'Charge per kg for weight-based model' },
        { key: 'delivery_min_charge', label: 'Minimum Charge (₹)', type: 'number', default: 0, min: 0, description: 'Minimum delivery charge' },
        { key: 'delivery_max_charge', label: 'Maximum Charge (₹)', type: 'number', default: null, min: 0, description: 'Maximum delivery charge (leave 0 for no limit)' },
        { key: 'delivery_free_threshold', label: 'Free Delivery Threshold (₹)', type: 'number', default: 0, min: 0, description: 'Order value above which delivery is free' },
        { key: 'delivery_zones', label: 'Delivery Zones (JSON)', type: 'json', default: [], description: 'Zone-based delivery charges: [{"name": "Zone1", "charge": 50}]' }
      ]
    },
    cms: {
      title: 'Content Management',
      fields: [
        { key: 'discover_section', label: 'Discover RR Nagar Section', type: 'json', default: [], description: 'JSON array of discover items' },
        { key: 'mega_ads_left', label: 'Left Sidebar Mega Ads', type: 'json', default: [], description: 'JSON array of left sidebar ads' },
        { key: 'mega_ads_right', label: 'Right Sidebar Mega Ads', type: 'json', default: [], description: 'JSON array of right sidebar ads' },
        { key: 'scrolling_ads', label: 'Scrolling Ads', type: 'json', default: [], description: 'JSON array of scrolling banner ads' },
        { key: 'checkout_offers', label: 'Checkout Offers', type: 'json', default: [], description: 'JSON array of checkout offers (title, description, code, type, value)' },
        { key: 'checkout_ads', label: 'Checkout Ads', type: 'json', default: [], description: 'JSON array of checkout ads (title, image, link, text)' }
      ]
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/config`, { withCredentials: true });
      setConfigs(res.data || {});
    } catch (err) {
      console.error('Load config error:', err);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (key, value, type) => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      let processedValue = value;
      if (type === 'number') {
        processedValue = parseFloat(value) || 0;
      } else if (type === 'json') {
        try {
          processedValue = typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          setMessage({ type: 'error', text: 'Invalid JSON format' });
          return;
        }
      }

      await axios.put(
        `${API_BASE}/admin/config/${key}`,
        {
          value: processedValue,
          type: type,
          category: getCategoryForKey(key)
        },
        { withCredentials: true }
      );

      setConfigs(prev => ({ ...prev, [key]: processedValue }));
      setMessage({ type: 'success', text: 'Configuration saved successfully' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Update config error:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryForKey = (key) => {
    if (key.includes('delivery')) return 'delivery';
    if (key.includes('commission') || (key.includes('fee') && !key.includes('delivery')) || key.includes('amount')) return 'fees';
    if (key.includes('discover') || key.includes('ads') || key.includes('mega')) return 'cms';
    return 'general';
  };

  const getValue = (key, defaultValue) => {
    if (configs[key] !== undefined) {
      if (typeof configs[key] === 'object') {
        return JSON.stringify(configs[key], null, 2);
      }
      return configs[key];
    }
    return defaultValue;
  };

  const handleChange = (key, value, type) => {
    if (type === 'json') {
      // Validate JSON on change
      try {
        JSON.parse(value);
        updateConfig(key, value, type);
      } catch {
        // Invalid JSON, but allow editing
        setConfigs(prev => ({ ...prev, [key]: value }));
      }
    } else {
      updateConfig(key, value, type);
    }
  };

  if (loading) {
    return <div className="platform-config-loading">Loading configuration...</div>;
  }

  return (
    <div className="platform-config">
      <h1>Platform Configuration</h1>
      <p className="config-description">
        Manage platform fees, margins, and content settings. Changes take effect immediately.
      </p>

      {message.text && (
        <div className={`config-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {Object.entries(configStructure).map(([category, section]) => (
        <div key={category} className="config-section">
          <h2>{section.title}</h2>
          <div className="config-fields">
            {section.fields.map(field => (
              <div key={field.key} className="config-field">
                <label>
                  {field.label}
                  {field.description && (
                    <span className="field-description">{field.description}</span>
                  )}
                </label>
                {field.type === 'json' ? (
                  <div>
                    <textarea
                      value={getValue(field.key, JSON.stringify(field.default, null, 2))}
                      onChange={(e) => {
                        setConfigs(prev => ({ ...prev, [field.key]: e.target.value }));
                      }}
                      rows={12}
                      placeholder={JSON.stringify(field.default, null, 2)}
                      className="config-input config-textarea"
                    />
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      Format: JSON array of objects. Example: [{'{"title": "Temples", "icon": "🛕", "link": "/temples"}'}]
                    </div>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={getValue(field.key, field.default)}
                    onChange={(e) => handleChange(field.key, e.target.value, field.type)}
                    min={field.min}
                    max={field.max}
                    step={field.type === 'number' ? 0.01 : undefined}
                    className="config-input"
                  />
                )}
                {field.type === 'json' && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentValue = configs[field.key] || JSON.stringify(field.default, null, 2);
                      try {
                        const parsed = typeof currentValue === 'string' ? JSON.parse(currentValue) : currentValue;
                        updateConfig(field.key, parsed, field.type);
                      } catch (err) {
                        setMessage({ type: 'error', text: `Invalid JSON: ${err.message}. Please fix the format.` });
                      }
                    }}
                    className="save-json-btn"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save JSON'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {saving && (
        <div className="config-saving">Saving...</div>
      )}
    </div>
  );
}
