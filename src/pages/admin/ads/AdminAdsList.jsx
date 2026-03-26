import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/client";

const normalizeAds = (items, source, startingIndex = 0) =>
  (Array.isArray(items) ? items : []).map((item, index) => ({
    id: item.id || `${source}-${startingIndex + index + 1}`,
    title: item.title || item.name || item.text || `${source} ${startingIndex + index + 1}`,
    imageUrl: item.imageUrl || item.image_url || item.image || item.url || item.src || "",
    targetUrl: item.targetUrl || item.link || item.href || "",
    source
  }));

const AdminAdsList = () => {
  const [ads, setAds] = useState([]);

  const loadAds = async () => {
    try {
      const res = await api.get("/admin/ads");
      let list = normalizeAds(res.data, "advertisements");

      if (list.length === 0) {
        const fallback = await api.get("/ads");
        list = normalizeAds(fallback.data, "public_ads");
      }

      if (list.length === 0) {
        const [checkoutAds, megaLeftAds, megaRightAds, scrollingAds] = await Promise.all([
          api.get("/cms/checkout-ads"),
          api.get("/cms/mega-ads/left"),
          api.get("/cms/mega-ads/right"),
          api.get("/cms/scrolling-ads")
        ]);

        list = [
          ...normalizeAds(checkoutAds.data, "checkout_ads"),
          ...normalizeAds(megaLeftAds.data, "mega_ads_left", 100),
          ...normalizeAds(megaRightAds.data, "mega_ads_right", 200),
          ...normalizeAds(scrollingAds.data, "scrolling_ads", 300)
        ];
      }

      setAds(list);
    } catch (err) {
      console.error("Failed loading ads:", err);
      try {
        const [fallback, checkoutAds, megaLeftAds, megaRightAds, scrollingAds] = await Promise.all([
          api.get("/ads"),
          api.get("/cms/checkout-ads"),
          api.get("/cms/mega-ads/left"),
          api.get("/cms/mega-ads/right"),
          api.get("/cms/scrolling-ads")
        ]);

        const list = [
          ...normalizeAds(fallback.data, "public_ads"),
          ...normalizeAds(checkoutAds.data, "checkout_ads"),
          ...normalizeAds(megaLeftAds.data, "mega_ads_left", 100),
          ...normalizeAds(megaRightAds.data, "mega_ads_right", 200),
          ...normalizeAds(scrollingAds.data, "scrolling_ads", 300)
        ];
        setAds(list);
      } catch (fallbackErr) {
        console.error("Fallback ads load failed", fallbackErr);
        setAds([]);
      }
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const deleteAd = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    try {
      await api.delete(`/admin/ads/${id}`);
      loadAds();
    } catch (err) {
      console.error("Delete ad failed", err);
      alert("Failed to delete ad");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Advertisements</h1>

      <Link
        to="/admin/ads/new"
        className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-5"
      >
        Create New Ad
      </Link>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Image</th>
            <th className="border p-2">Link</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {ads.map((ad) => (
            <tr key={`${ad.source || "ad"}-${ad.id}`}>
              <td className="border p-2">{ad.id}</td>
              <td className="border p-2">
                <div>{ad.title || "Untitled"}</div>
                <div className="text-xs text-gray-500">{ad.source || "advertisement"}</div>
              </td>
              <td className="border p-2">
                {ad.imageUrl ? (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title || "ad"}
                    className="w-32 rounded"
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="border p-2">
                {ad.targetUrl ? (
                  <a
                    href={ad.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Visit
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="border p-2">
                <Link
                  to={`/admin/ads/${ad.id}/edit`}
                  className="text-blue-600 mr-3"
                >
                  Edit
                </Link>

                <button
                  onClick={() => deleteAd(ad.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {ads.length === 0 && (
            <tr>
              <td className="border p-2 text-center" colSpan={5}>
                No advertisements found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminAdsList;
