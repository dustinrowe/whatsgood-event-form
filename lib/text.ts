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

/**
 * Give every run of non-breaking spaces a real, breakable space at its end.
 *
 * Quill 2's HTML serializer runs `escapeText(...).replaceAll(" ", "&nbsp;")`
 * (quill@2.0.3, `blots/scroll` → `getHTML`), so *every* space in a description
 * comes back as `&nbsp;` — and `react-quill-new` serializes with
 * `getSemanticHTML()` by default. A submitted paragraph therefore reaches our
 * renderers as one unbreakable token, and anything drawing it with
 * `overflow-wrap: anywhere` / `break-word` has to split it mid-word:
 * "Court street for lo / cal vendors" (ENG-425).
 *
 * A lone `&nbsp;` — the overwhelming case, an ordinary word gap Quill mangled —
 * becomes a plain space. A run of N keeps N-1 non-breaking spaces so deliberate
 * multi-space indentation still renders at full width, while the space ending
 * the run means the run can never glue two words together.
 *
 * Deliberately tag-blind, so an NBSP inside an attribute value is rewritten too.
 * The editor's format set is bold/italic/list/link, so the only attribute in play
 * is `href`, which cannot meaningfully carry a raw NBSP.
 */
export function restoreBreakableSpaces(html: string): string {
  return html
    // Literal U+00A0 (pasted from Word/Docs) and the numeric entities, folded onto
    // one spelling so the run rule below sees every form.
    .replace(/\u00A0/g, "&nbsp;")
    .replace(/&#(?:160|x0*a0);/gi, "&nbsp;")
    // The last non-breaking space of a run, unless the run already ends against
    // ordinary whitespace — that is both the wrap opportunity we are after and what
    // keeps this idempotent, so re-running it never nibbles away a preserved run.
    .replace(/&nbsp;(?!&nbsp;)(?!\s)/g, " ");
}

/**
 * The one thing to call on a Quill description before sending it anywhere.
 *
 * `restoreBreakableSpaces` runs first on purpose: a "blank" line the user made
 * with a single space arrives as `<p>&nbsp;</p>`, which only becomes the
 * `<p> </p>` that `normalizeQuillHtml` recognises after the spaces are restored.
 */
export function prepareDescriptionHtml(html: string): string {
  return normalizeQuillHtml(restoreBreakableSpaces(html));
}
