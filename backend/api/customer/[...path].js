import { getBearerToken, setCors } from "../_lib/auth.js";

function readBody(body) {
  if (!body || typeof body === "object") return body || {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function getParts(req) {
  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  const route = pathname.replace(/^\/api\/customer\/?/, "").replace(/^\/customer\/?/, "");
  return route.split("/").filter(Boolean);
}

function parseGuestAddresses(req) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)rrpn_guest_addresses=([^;]+)/);
  if (!match) return [];

  try {
    const raw = Buffer.from(decodeURIComponent(match[1]), "base64url").toString("utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setGuestAddresses(res, addresses) {
  const value = Buffer.from(JSON.stringify(addresses.slice(-5))).toString("base64url");
  res.setHeader(
    "Set-Cookie",
    `rrpn_guest_addresses=${encodeURIComponent(value)}; Path=/; Max-Age=2592000; SameSite=None; Secure; HttpOnly`
  );
}

function toAddress(body = {}) {
  const now = new Date().toISOString();
  return {
    id: body.id || `guest-${Date.now()}`,
    name: String(body.name || body.fullName || "").trim(),
    phone: String(body.phone || body.mobile || "").trim(),
    addressLine: String(body.addressLine || body.address || "").trim(),
    city: String(body.city || "Bengaluru").trim(),
    state: String(body.state || "Karnataka").trim(),
    pincode: String(body.pincode || body.pinCode || "").trim(),
    isDefault: Boolean(body.isDefault ?? true),
    createdAt: now,
    updatedAt: now,
  };
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const parts = getParts(req);
  if (parts[0] !== "address") {
    return res.status(404).json({ error: "Resource not found" });
  }

  if (parts[1] === "guest" || req.query?.guest === "1") {
    if (req.method === "GET") return res.status(200).json(parseGuestAddresses(req));

    if (req.method === "POST") {
      const address = toAddress(readBody(req.body));
      if (!address.name || !address.phone || !address.addressLine) {
        return res.status(400).json({ error: "Name, phone and address are required" });
      }
      const addresses = parseGuestAddresses(req);
      setGuestAddresses(res, [...addresses.filter((item) => item.id !== address.id), address]);
      return res.status(201).json(address);
    }
  }

  if (parts.length === 1) {
    if (req.method === "GET") {
      if (!getBearerToken(req)) {
        return res.status(401).json({ error: "Login required to load saved addresses" });
      }
      return res.status(200).json([]);
    }

    if (req.method === "POST") {
      const address = toAddress(readBody(req.body));
      if (!address.name || !address.phone || !address.addressLine) {
        return res.status(400).json({ error: "Name, phone and address are required" });
      }
      const addresses = parseGuestAddresses(req);
      setGuestAddresses(res, [...addresses.filter((item) => item.id !== address.id), address]);
      return res.status(201).json(address);
    }
  }

  if (!getBearerToken(req)) {
    return res.status(401).json({ error: "Login required to manage saved addresses" });
  }

  if (["PUT", "DELETE"].includes(req.method)) {
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", "GET, POST, PUT, DELETE, OPTIONS");
  return res.status(405).json({ error: "Method Not Allowed" });
}
