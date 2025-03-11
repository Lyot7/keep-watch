/**
 * Decode HTML entities like &amp;, &lt;, &gt;, &#39; etc.
 * @param html String containing HTML entities
 * @returns Decoded string
 */
export function decodeHtml(html: string): string {
  if (!html) return "";

  // Create a temporary text area element to leverage browser's built-in HTML entity decoding
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;

  // Return the decoded text
  return textarea.value;
}
