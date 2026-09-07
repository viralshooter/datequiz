/**
 * Accepts whatever people actually paste — "@pietro", "pietro",
 * "instagram.com/pietro", "https://www.instagram.com/pietro/?igshid=x" —
 * and returns the bare lowercase username, or null if it isn't a valid
 * Instagram handle (letters, digits, periods, underscores, max 30).
 */
export function normalizeInstagramHandle(input: string): string | null {
  let value = input.trim();
  if (!value) return null;

  const urlMatch = value.match(/(?:^|\/\/)(?:www\.)?instagram\.com\/([^/?#\s]+)/i);
  if (urlMatch) value = urlMatch[1];

  value = value.replace(/^@/, "").replace(/\/+$/, "").toLowerCase();

  return /^[a-z0-9._]{1,30}$/.test(value) ? value : null;
}

export function instagramProfileUrl(handle: string): string {
  return `https://instagram.com/${handle}`;
}
