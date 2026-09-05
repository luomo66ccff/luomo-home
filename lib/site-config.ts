export function getSiteUrl(): URL {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://luomo.moe");
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid site URL");
    return new URL(url.origin);
  } catch { return new URL("https://luomo.moe"); }
}
export function getSiteName() { return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "Luomo / 洛墨"; }
