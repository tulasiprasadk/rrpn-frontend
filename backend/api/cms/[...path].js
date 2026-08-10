import { setCors } from "../_lib/auth.js";
import { listAds, readConfig } from "../_lib/adminStores.js";

function getRoute(req) {
  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  return pathname.replace(/^\/api\/cms\/?/, "").replace(/^\/cms\/?/, "");
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const route = getRoute(req);
  if (route === "checkout-offers") {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    const config = await readConfig();
    return res.status(200).json(Array.isArray(config.checkout_offers) ? config.checkout_offers : []);
  }

  if (["checkout-ads", "scrolling-ads", "mega-ads/left", "mega-ads/right"].includes(route)) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET, OPTIONS");
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const placement =
      route === "checkout-ads" ? "checkout_ads" :
      route === "scrolling-ads" ? "scrolling_ads" :
      route === "mega-ads/left" ? "mega_ads_left" :
      "mega_ads_right";

    const ads = (await listAds())
      .filter((ad) => ad.active !== false && ad.placement === placement)
      .map((ad) => ({
        ...ad,
        image: ad.imageUrl,
        link: ad.targetUrl || ad.link,
      }));

    return res.status(200).json(ads);
  }

  return res.status(404).json({ error: "Resource not found" });
}
