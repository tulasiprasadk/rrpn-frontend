import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import axios from 'axios';
import './AdminBlogs.css';

export default function AdminBlogs() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadBlogs();
  }, [statusFilter, searchTerm]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await axios.get(`${API_BASE}/admin/blogs?${params}`, { withCredentials: true });
      setBlogs(res.data.blogs || []);
    } catch (err) {
      console.error('Load blogs error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      await axios.delete(`${API_BASE}/admin/blogs/${id}`, { withCredentials: true });
      loadBlogs();
    } catch (err) {
      alert('Failed to delete blog');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Not published';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="admin-blogs-loading">Loading blogs...</div>;
  }

  return (
    <div className="admin-blogs">
      <div className="admin-blogs-header">
        <h1>Blog Management</h1>
        <button 
          className="btn-primary"
          onClick={() => navigate('/admin/blogs/new')}
        >
          + New Blog Post
        </button>
      </div>

      <div className="admin-blogs-filters">
        <input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="admin-blogs-list">
        {blogs.length === 0 ? (
          <div className="no-blogs">
            <p>No blogs found. Create your first blog post!</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/admin/blogs/new')}
            >
              Create Blog Post
            </button>
          </div>
        ) : (
          blogs.map(blog => (
            <div key={blog.id} className="blog-card">
              <div className="blog-card-header">
                <h3>{blog.title}</h3>
                <span className={`status-badge status-${blog.status}`}>
                  {blog.status}
                </span>
              </div>
              <p className="blog-excerpt">{blog.excerpt || blog.content.substring(0, 150) + '...'}</p>
              <div className="blog-card-footer">
                <div className="blog-meta">
                  <span>Author: {blog.author?.name || 'Unknown'}</span>
                  <span>Published: {formatDate(blog.publishedAt)}</span>
                  <span>Views: {blog.views || 0}</span>
                </div>
                <div className="blog-actions">
                  <button
                    className="btn-edit"
                    onClick={() => navigate(`/admin/blogs/${blog.id}/edit`)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(blog.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
