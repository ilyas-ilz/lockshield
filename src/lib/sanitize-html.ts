import sanitizeHtml from "sanitize-html";

/**
 * Allow-list sanitizer for CMS rich text stored as a raw HTML string.
 *
 * WHY: the Tiptap editor saves JSON, but Post.body is Mixed - an HTML string
 * arrives from legacy imports or from a body sent straight to the API. The
 * public blog renders strings with dangerouslySetInnerHTML, so anything not
 * listed here (<script>, <iframe>, on* handlers, javascript: URLs, style) is
 * dropped before it can run in a visitor's browser.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h2", "h3", "h4",
    "strong", "b", "em", "i", "u", "s", "code", "pre", "blockquote",
    "ul", "ol", "li",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  // The editor allows base64 images; an <img> never executes script, even for SVG data.
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  transformTags: {
    // target="_blank" without noopener lets the opened page script window.opener.
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS);
}
