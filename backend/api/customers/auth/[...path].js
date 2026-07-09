import {
  env,
  getBackendUrl,
  getFrontendUrl,
  isConfiguredSecret,
  signToken,
} from "../../_lib/auth.js";

function getParts(req) {
  const pathname = new URL(req.url || "/", "https://backend.local").pathname;
  const route = pathname
    .replace(/^\/api\/customers\/auth\/?/, "")
    .replace(/^\/customers\/auth\/?/, "");
  return route.split("/").filter(Boolean);
}

function redirectToGoogle(req, res) {
  const clientId = env("GOOGLE_CLIENT_ID");
  if (!isConfiguredSecret(clientId)) {
    return res.status(500).end("GOOGLE_CLIENT_ID is not configured");
  }

  const redirectUri = `${getBackendUrl(req)}/api/customers/auth/google/callback`;
  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "select_account");

  return res.redirect(302, googleUrl.toString());
}

async function handleGoogleCallback(req, res) {
  const frontendUrl = getFrontendUrl();
  const errorRedirect = (message) => {
    const url = new URL("/login", frontendUrl);
    url.searchParams.set("error", message);
    return res.redirect(302, url.toString());
  };

  try {
    const { code, error } = req.query;
    if (error) return errorRedirect(String(error));
    if (!code) return errorRedirect("missing_google_code");

    const clientId = env("GOOGLE_CLIENT_ID");
    const clientSecret = env("GOOGLE_CLIENT_SECRET");
    const jwtSecret = env("JWT_SECRET", "SESSION_SECRET");

    if (!isConfiguredSecret(clientId) || !isConfiguredSecret(clientSecret) || !isConfiguredSecret(jwtSecret)) {
      return errorRedirect("google_auth_not_configured");
    }

    const redirectUri = `${getBackendUrl(req)}/api/customers/auth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: String(code),
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      return errorRedirect("google_token_exchange_failed");
    }

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.email) {
      return errorRedirect("google_profile_failed");
    }

    const token = signToken({
      sub: profile.id || profile.email,
      email: profile.email,
      name: profile.name || profile.email,
      picture: profile.picture || null,
      role: "user",
    });

    const successUrl = new URL("/oauth-success", frontendUrl);
    successUrl.searchParams.set("token", token);
    successUrl.searchParams.set("role", "user");
    return res.redirect(302, successUrl.toString());
  } catch {
    return errorRedirect("google_auth_failed");
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end("Method Not Allowed");
  }

  const parts = getParts(req);
  if (parts[0] !== "google") return res.status(404).end("Not Found");
  if (parts[1] === "callback") return handleGoogleCallback(req, res);
  return redirectToGoogle(req, res);
}
