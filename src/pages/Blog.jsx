import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { API_BASE } from '../config/api';
import axios from 'axios';
import './Blog.css';

export default function Blog() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (slug) {
      loadBlog(slug);
    } else {
      loadBlogs();
    }
  }, [slug, page]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/blogs?page=${page}&limit=10`);
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error('Load blogs error:', err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBlog = async (blogSlug) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/blogs/${blogSlug}`);
      setBlog(res.data);
    } catch (err) {
      console.error('Load blog error:', err);
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="blog-loading">Loading...</div>;
  }

  // Single blog view
  if (blog) {
    return (
      <div className="blog-container">
        <div className="blog-detail">
          <button onClick={() => navigate('/blog')} className="back-btn">
            ← Back to Blogs
          </button>
          
          {blog.featuredImage && (
            <img src={blog.featuredImage} alt={blog.title} className="blog-featured-image" />
          )}
          
          <h1 className="blog-title">{blog.title}</h1>
          
          <div className="blog-meta">
            <span>By {blog.author?.name || 'Admin'}</span>
            <span>•</span>
            <span>{formatDate(blog.publishedAt)}</span>
            <span>•</span>
            <span>{blog.views || 0} views</span>
            {blog.tags && (
              <>
                <span>•</span>
                <div className="blog-tags">
                  {blog.tags.split(',').map((tag, i) => (
                    <span key={i} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} />
        </div>
      </div>
    );
  }

  // Blog listing
  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Latest news and updates from RR Nagar</p>
      </div>

      {blogs.length === 0 ? (
        <div className="no-blogs">
          <p>No blog posts available yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="blog-list">
            {blogs.map((blogItem) => (
              <article key={blogItem.id} className="blog-card">
                {blogItem.featuredImage && (
                  <img 
                    src={blogItem.featuredImage} 
                    alt={blogItem.title} 
                    className="blog-card-image"
                    onClick={() => navigate(`/blog/${blogItem.slug}`)}
                  />
                )}
                <div className="blog-card-content">
                  <h2 onClick={() => navigate(`/blog/${blogItem.slug}`)}>
                    {blogItem.title}
                  </h2>
                  <p className="blog-excerpt">{blogItem.excerpt || blogItem.content.substring(0, 200) + '...'}</p>
                  <div className="blog-card-meta">
                    <span>{formatDate(blogItem.publishedAt)}</span>
                    <span>•</span>
                    <span>{blogItem.views || 0} views</span>
                    {blogItem.tags && (
                      <>
                        <span>•</span>
                        <span className="blog-tags-small">
                          {blogItem.tags.split(',').slice(0, 2).map((tag, i) => (
                            <span key={i} className="tag-small">{tag.trim()}</span>
                          ))}
                        </span>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/blog/${blogItem.slug}`)}
                    className="read-more-btn"
                  >
                    Read More →
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="blog-pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
