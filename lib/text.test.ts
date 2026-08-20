import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isRichTextEmpty,
  normalizeQuillHtml,
  prepareDescriptionHtml,
  restoreBreakableSpaces,
  stripHtml,
} from "./text.ts";

const NBSP = "\u00A0";

test("ENG-425: a Quill paragraph comes back with real spaces", () => {
  // What quill@2.0.3 actually emits — `escapeText(...).replaceAll(" ", "&nbsp;")`.
  // Rendered as one unbreakable token it split as "for lo / cal vendors".
  const quill =
    "<p>Join&nbsp;us&nbsp;for&nbsp;our&nbsp;third&nbsp;annual&nbsp;Downtown&nbsp;Oktoberfest.</p>";
  assert.equal(
    restoreBreakableSpaces(quill),
    "<p>Join us for our third annual Downtown Oktoberfest.</p>",
  );
});

test("a run of non-breaking spaces keeps its width but gains a wrap point", () => {
  assert.equal(
    restoreBreakableSpaces("a&nbsp;&nbsp;&nbsp;b"),
    "a&nbsp;&nbsp; b",
  );
});

test("literal U+00A0 and numeric entities are handled, not just &nbsp;", () => {
  assert.equal(restoreBreakableSpaces(`for lo${NBSP}cal`), "for lo cal");
  assert.equal(restoreBreakableSpaces("for lo&#160;cal"), "for lo cal");
  assert.equal(restoreBreakableSpaces("for lo&#xA0;cal"), "for lo cal");
  // Mixed spellings inside one run still collapse to a single trailing space.
  assert.equal(restoreBreakableSpaces(`a&nbsp;${NBSP}b`), "a&nbsp; b");
});

test("markup survives untouched", () => {
  assert.equal(
    restoreBreakableSpaces(
      '<p><strong>Live&nbsp;music</strong> and <a href="https://x.test/a?b=1">tickets</a></p>',
    ),
    '<p><strong>Live music</strong> and <a href="https://x.test/a?b=1">tickets</a></p>',
  );
});

test("restoreBreakableSpaces is idempotent", () => {
  const once = restoreBreakableSpaces("a&nbsp;&nbsp;b&nbsp;c");
  assert.equal(restoreBreakableSpaces(once), once);
});

test("a space-only line becomes a real blank line, not a collapsed one", () => {
  // Ordering guard: `<p>&nbsp;</p>` only reaches normalizeQuillHtml's `<p>\s*</p>`
  // rule after the spaces are restored. Reversing the two would leave `<p> </p>`,
  // which has no line box and disappears when rendered.
  assert.equal(
    prepareDescriptionHtml("<p>Doors&nbsp;at&nbsp;7</p><p>&nbsp;</p><p>Show&nbsp;at&nbsp;8</p>"),
    "<p>Doors at 7</p><p><br></p><p>Show at 8</p>",
  );
});

test("prepareDescriptionHtml still restores Quill's empty paragraphs", () => {
  assert.equal(prepareDescriptionHtml("<p>a</p><p></p><p>b</p>"), "<p>a</p><p><br></p><p>b</p>");
});

test("normalizeQuillHtml leaves non-empty paragraphs alone", () => {
  assert.equal(normalizeQuillHtml("<p>a</p>"), "<p>a</p>");
});

test("stripHtml and isRichTextEmpty are unaffected", () => {
  assert.equal(stripHtml("<p>Live&nbsp;music</p>"), "Live music");
  assert.equal(isRichTextEmpty("<p><br></p>"), true);
  assert.equal(isRichTextEmpty("<p>a</p>"), false);
});
