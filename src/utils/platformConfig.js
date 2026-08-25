import { API_BASE } from "../config/api";

export async function loadPlatformConfig() {
  try {
    const response = await fetch(`${API_BASE}/admin/config`, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to load platform config");
    return await response.json();
  } catch (error) {
    console.warn("Using default platform config:", error.message);
    return { platform_commission: 15 };
  }
}

export async function loadPlatformMargin() {
  const config = await loadPlatformConfig();
  const margin = Number(config.platform_commission);
  return Number.isFinite(margin) ? margin : 15;
}
