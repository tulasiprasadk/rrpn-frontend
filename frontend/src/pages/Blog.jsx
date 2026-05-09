import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import "./Blog.css";

const fallbackBlogs = [
  {
    id: "local-1",
    title: "Fresh Picks: How We Source Daily Groceries",
    excerpt: "A quick look at how our team partners with local vendors to bring you fresh produce every day.",
    content:
      "We work with trusted local suppliers to ensure freshness and quality. From early-morning sourcing to same-day availability, our process keeps your kitchen stocked with the best picks.",
    featuredImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=60",
    tags: ["Groceries", "Fresh"],
    publishedAt: new Date().toISOString(),
    author: { name: "RR Nagar Team" },
  },
  {
    id: "local-2",
    title: "Festival Ready: Crackers Safety Checklist",
    excerpt: "Enjoy celebrations responsibly with our quick safety checklist.",
    content:
      "Celebrate with care. Keep a safe distance, use a bucket of water, and make sure children are supervised. Choose quality products for a joyful and safe festival season.",
    featuredImage: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=1200&q=60",
    tags: ["Crackers", "Safety"],
    publishedAt: new Date().toISOString(),
    author: { name: "RR Nagar Team" },
  },
  {
    id: "local-3",
    title: "Flowers That Last: Simple Care Tips",
    excerpt: "Keep your flowers fresh longer with these easy tips.",
    content:
      "Trim stems at an angle, change water daily, and keep flowers away from direct heat. These small steps can extend freshness by days.",
    featuredImage: "https://images.unsplash.com/photo-1468327768560-75b778cbb551?auto=format&fit=crop&w=1200&q=60",
    tags: ["Flowers", "Care"],
    publishedAt: new Date().toISOString(),
    author: { name: "RR Nagar Team" },
  },
];

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Blog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (slug) {
          const res = await api.get(`/blogs/${slug}`);
          setBlog(res.data);
        } else {
          const res = await api.get("/blogs?page=1&limit=10");
          const list = res.data?.blogs || [];
          setBlogs(list);
          setPagination(res.data?.pagination || null);
        }
      } catch (err) {
        if (slug) {
          const fallback = fallbackBlogs.find((b) => generateSlug(b.title) === slug);
          setBlog(fallback || null);
        } else {
          setBlogs(fallbackBlogs);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return <div className="blog-loading">Loading blogs...</div>;
  }

  if (slug && blog) {
    return (
      <div className="blog-container">
        <div className="blog-detail">
          <button className="back-btn" onClick={() => navigate("/blog")}>
            ← Back to Blogs
          </button>
          {blog.featuredImage && (
            <img className="blog-featured-image" src={blog.featuredImage} alt={blog.title} />
          )}
          <h1 className="blog-title">{blog.title}</h1>
          <div className="blog-meta">
            <span>By {blog.author?.name || "RR Nagar"}</span>
            <span>•</span>
            <span>{new Date(blog.publishedAt || Date.now()).toLocaleDateString()}</span>
          </div>
          {blog.tags && (
            <div className="blog-tags">
              {(Array.isArray(blog.tags) ? blog.tags : String(blog.tags).split(",")).map((tag) => (
                <span className="tag" key={tag}>
                  {String(tag).trim()}
                </span>
              ))}
            </div>
          )}
          <div className="blog-content">
            {(blog.content || "").split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog</h1>
        <p>Latest updates, tips, and local stories.</p>
      </div>

      {blogs.length === 0 ? (
        <div className="no-blogs">No blog posts yet.</div>
      ) : (
        <div className="blog-list">
          {blogs.map((post) => {
            const postSlug = post.slug || generateSlug(post.title || "");
            return (
              <article key={post.id || postSlug} className="blog-card">
                {post.featuredImage && (
                  <img
                    className="blog-card-image"
                    src={post.featuredImage}
                    alt={post.title}
                    onClick={() => navigate(`/blog/${postSlug}`)}
                  />
                )}
                <div className="blog-card-content">
                  <h2 onClick={() => navigate(`/blog/${postSlug}`)}>{post.title}</h2>
                  <div className="blog-card-meta">
                    <span>By {post.author?.name || "RR Nagar"}</span>
                    <span>•</span>
                    <span>{new Date(post.publishedAt || Date.now()).toLocaleDateString()}</span>
                    {post.tags && (
                      <>
                        <span>•</span>
                        <span className="tag-small">
                          {(Array.isArray(post.tags) ? post.tags : String(post.tags).split(","))[0]}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="blog-excerpt">
                    {post.excerpt || (post.content || "").substring(0, 160) + "..."}
                  </p>
                  <button className="read-more-btn" onClick={() => navigate(`/blog/${postSlug}`)}>
                    Read More
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {pagination && (
        <div className="blog-pagination">
          <button className="pagination-btn" disabled>
            Prev
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button className="pagination-btn" disabled>
            Next
          </button>
        </div>
      )}
    </div>
  );
}



