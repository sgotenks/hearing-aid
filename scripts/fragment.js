/**
 * Brings a nav/footer fragment to one shape, whether it comes from the workspace or from AEM.
 * AEM wraps list-item content in paragraphs (<li><p><a>…</a></p><ul>…) and splits a link that
 * holds an icon and a label into an icon link and a text link to the same address.
 * @param {Element} root fragment root
 */
export function normalizeFragment(root) {
  root.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  root.querySelectorAll('a').forEach((a) => {
    if (!root.contains(a)) return; // already merged into the previous link
    let next = a.nextSibling;
    while (next?.nodeType === Node.TEXT_NODE && !next.textContent.trim()) next = next.nextSibling;
    if (next?.tagName === 'A' && next.getAttribute('href') === a.getAttribute('href')) {
      a.append(...next.childNodes);
      next.remove();
    }
  });
}

/**
 * Takes the first link of a section (authored as a one-item list so AEM keeps its image)
 * and returns it in a paragraph, replacing the section's content.
 * @param {Element} container section wrapper
 * @returns {Element|null} the link
 */
export function liftSectionLink(container) {
  const link = container.querySelector('a');
  if (!link) return null;
  const p = document.createElement('p');
  p.append(link);
  container.replaceChildren(p);
  return link;
}

/**
 * Turns the visible text of an image link into its accessible name (e.g. a logo link).
 * @param {Element} link the link
 * @param {string} fallback name used when the link has no text
 * @param {(text: string) => string} [format] builds the name from the text
 */
export function textToLinkName(link, fallback, format = (text) => text) {
  const texts = [...link.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE);
  const text = texts.map((n) => n.textContent).join('').trim();
  texts.forEach((n) => n.remove());
  if (!link.getAttribute('aria-label')) link.setAttribute('aria-label', text ? format(text) : fallback);
}
