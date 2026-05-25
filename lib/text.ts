/** Strip HTML tags and decode the few entities Quill emits, collapsing to plain text. */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * True when rich-text HTML has no visible text content.
 * Quill represents an empty editor as "<p><br></p>", which is non-empty as a
 * string — so plain `.trim()` checks would wrongly treat it as filled.
 */
export function isRichTextEmpty(html: string): boolean {
  if (!html) return true;
  return stripHtml(html).length === 0;
}

/**
 * Quill 2's getSemanticHTML() serializes blank lines as empty "<p></p>", which
 * has no line-box and collapses when rendered as HTML (so consecutive blank
 * rows disappear). Restore the "<p><br></p>" form the renderers display as a
 * real blank line. Run at submit time only — feeding this back into the
 * controlled editor would mismatch its native output and jump the cursor.
 */
export function normalizeQuillHtml(html: string): string {
  return html.replace(/<p>\s*<\/p>/g, "<p><br></p>");
}
