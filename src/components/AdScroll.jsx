import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config/api";
import "./AdScroll.css";

export default function AdScroll() {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    loadScrollingAds();
  }, []);

  async function loadScrollingAds() {
    try {
      // Try CMS API first
      const cmsRes = await axios.get(`${API_BASE}/cms/scrolling-ads`);
      if (cmsRes.data && Array.isArray(cmsRes.data) && cmsRes.data.length > 0) {
        setAds(cmsRes.data.map(ad => ({
          id: ad.id || Math.random(),
          title: ad.title || ad.name,
          imageUrl: ad.image || ad.imageUrl,
          link: ad.link || ad.url
        })));
        return;
      }
    } catch (err) {
      console.log('CMS scrolling ads not available, falling back to regular ads');
    }

    // Fallback to regular ads API
    try {
      const res = await axios.get(`${API_BASE}/ads`, { withCredentials: true });
      if (!Array.isArray(res.data)) {
        setAds([]);
        return;
      }

      const automatedAds = res.data
        .filter(
          (ad) =>
            ad.isActive !== false &&
            ad.position === "grid" &&
            ad.imageUrl
        )
        .slice(0, 5);

      setAds(automatedAds);
    } catch (err) {
      console.error("Failed to load ads:", err);
      setAds([]);
    }
  }

  // If still no ads, show nothing (expected)
  if (ads.length === 0) return null;

  return (
    <div className="ad-scroll-container">
      <div className="ad-track">
        {ads.map((ad) => (
          <div key={ad.id} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 180 }}>
            <a
              href={ad.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block' }}
            >
              <img
                src={
                  ad.imageUrl.startsWith("/")
                    ? ad.imageUrl
                    : `/${ad.imageUrl}`
                }
                alt={ad.title || "Advertisement"}
                className="ad-banner"
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}



