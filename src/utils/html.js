/** Small DOM helpers. */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text for safe use inside HTML built with template strings (content and attributes). */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ESCAPES[ch]);
}

/** document.getElementById that fails loudly when the markup and the code disagree. */
export function byId(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id} in index.html`);
  return el;
}
