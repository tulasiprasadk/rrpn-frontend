import {
  env,
  getBearerToken,
  isConfiguredSecret,
  json,
  setCors,
  verifyToken,
} from "./auth.js";
import { upsertCustomer } from "./adminStores.js";

function getPath(req) {
  const routePath = req.query?.path;
  if (Array.isArray(routePath)) return routePath.map(String);
  if (routePath) return String(routePath).split("/").filter(Boolean);

  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  const route = pathname.replace(/^\/api\/auth\/?/, "").replace(/^\/auth\/?/, "");
  return route.split("/").filter(Boolean);
}

export default async function authRoute(req, res) {
  setCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const [route] = getPath(req);

  if (route === "status") {
    return json(res, 200, {
      ok: true,
      googleConfigured: Boolean(
        isConfiguredSecret(env("GOOGLE_CLIENT_ID")) &&
          isConfiguredSecret(env("GOOGLE_CLIENT_SECRET"))
      ),
    });
  }

  if (route === "me") {
    const payload = verifyToken(getBearerToken(req));
    if (!payload) {
      return json(res, 401, { loggedIn: false });
    }

    const user = await upsertCustomer({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      role: payload.role || "user",
    });

    return json(res, 200, {
      loggedIn: true,
      customer: user,
      user,
    });
  }

  return json(res, 404, { error: "Resource not found" });
}
