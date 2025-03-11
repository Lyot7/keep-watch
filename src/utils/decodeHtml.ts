/**
 * Decode HTML entities like &amp;, &lt;, &gt;, &#39; etc.
 * Works in both server and client environments.
 * @param html String containing HTML entities
 * @returns Decoded string
 */
export function decodeHtml(html: string): string {
  if (!html) return "";

  // Use a regex-based approach that works in both server and client environments
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x3D;/g, "=")
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}
