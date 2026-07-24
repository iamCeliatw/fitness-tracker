// 22-char base64url invite code (128-bit entropy via crypto.getRandomValues)
export function generateInviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
    .slice(0, 22);
}
