import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import axios from 'axios';
import './AdminBlogForm.css';

export default function AdminBlogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    featuredImage: '',
    status: 'draft',
    tags: '',
    metaTitle: '',
    metaDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      loadBlog();
    }
  }, [id]);

  const loadBlog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/blogs/${id}`, { withCredentials: true });
      const blog = res.data;
      setForm({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        featuredImage: blog.featuredImage || '',
        status: blog.status || 'draft',
        tags: blog.tags || '',
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || ''
      });
    } catch (err) {
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isEdit) {
        await axios.put(`${API_BASE}/admin/blogs/${id}`, form, { withCredentials: true });
      } else {
        await axios.post(`${API_BASE}/admin/blogs`, form, { withCredentials: true });
      }
      navigate('/admin/blogs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="blog-form-loading">Loading...</div>;
  }

  return (
    <div className="admin-blog-form">
      <div className="blog-form-header">
        <h1>{isEdit ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
        <button onClick={() => navigate('/admin/blogs')} className="btn-secondary">
          ← Back to Blogs
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>Content *</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            required
            rows={15}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label>Excerpt</label>
          <textarea
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            className="form-textarea"
            placeholder="Short summary for preview..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Featured Image URL</label>
            <input
              type="url"
              name="featuredImage"
              value={form.featuredImage}
              onChange={handleChange}
              className="form-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="form-input"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div className="form-group">
          <label>Meta Title (SEO)</label>
          <input
            type="text"
            name="metaTitle"
            value={form.metaTitle}
            onChange={handleChange}
            className="form-input"
            placeholder="SEO title (defaults to blog title)"
          />
        </div>

        <div className="form-group">
          <label>Meta Description (SEO)</label>
          <textarea
            name="metaDescription"
            value={form.metaDescription}
            onChange={handleChange}
            rows={2}
            className="form-textarea"
            placeholder="SEO description (defaults to excerpt)"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/admin/blogs')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : (isEdit ? 'Update Blog' : 'Create Blog')}
          </button>
        </div>
      </form>
    </div>
  );
}
