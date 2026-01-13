import React, { useState } from 'react';
import { API_BASE } from '../../config/api';

export default function AdminChangePassword() {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setOk('');
    if (!form.oldPassword || !form.newPassword) return setErr('Fill fields');
    if (form.newPassword !== form.confirm) return setErr('New passwords do not match');

    try {
      const res = await fetch(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword })
      });
      let data = null;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `Server error ${res.status}`;
        return setErr(msg);
      }
      setOk('Password updated successfully');
      setForm({ oldPassword: '', newPassword: '', confirm: '' });
    } catch (e) {
      setErr(e?.message || 'Network error');
    }
  };

  return (
    <div style={{ maxWidth: 520, padding: 20 }}>
      <h2>Change Password</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <input type="password" placeholder="Current password" value={form.oldPassword} onChange={update('oldPassword')} />
        <input type="password" placeholder="New password" value={form.newPassword} onChange={update('newPassword')} />
        <input type="password" placeholder="Confirm new password" value={form.confirm} onChange={update('confirm')} />

        {err && <div style={{ color: 'red' }}>{err}</div>}
        {ok && <div style={{ color: 'green' }}>{ok}</div>}

        <button type="submit">Change Password</button>
      </form>
    </div>
  );
}



