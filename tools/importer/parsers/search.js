/* eslint-disable */
/* global WebImporter */
/**
 * Parser for search.
 * Base block: search (xwalk model "search": index (text), classes (skipped)).
 * Source: https://www.amplifon.com/ca/ (.m-014-direction-post-wrapper with clinic search input)
 * Generated: 2026-10-01
 *
 * Source: span.title-heading "Find your nearest hearing clinic today." + input#location-input
 * + "Use my location" javascript link + submit button (interactive, not authorable).
 *
 * Output:
 *   - Default content before the block: H2 heading (from span.title-heading)
 *   - Block row 1: <!-- field:index --> link to the query index the search block reads
 *     (blocks/search/search.js uses block.querySelector('a[href]') as the index source).
 *     The site's query index is used since the source widget is a JS-only clinic locator.
 */
export default function parse(element, { document }) {
  const headingSrc = element.querySelector('.title-heading, h1, h2, h3, [class*="title"]');
  const input = element.querySelector('input');

  if (!headingSrc && !input) {
    element.replaceWith(...element.childNodes);
    return;
  }

  let heading = null;
  if (headingSrc && headingSrc.textContent.trim()) {
    if (/^H[1-6]$/.test(headingSrc.tagName)) {
      heading = headingSrc;
    } else {
      heading = document.createElement('h2');
      heading.textContent = headingSrc.textContent.trim();
    }
  }

  // Index source: an existing real (non-javascript:) link if the widget exposes one,
  // otherwise the site's query index.
  const realLink = [...element.querySelectorAll('a[href]')]
    .find((a) => !/^javascript:/i.test(a.getAttribute('href')) && /query-index/.test(a.getAttribute('href')));
  const indexHref = realLink ? realLink.getAttribute('href') : '/query-index.json';
  const indexLink = document.createElement('a');
  indexLink.href = indexHref;
  indexLink.textContent = indexHref;

  const indexCell = document.createDocumentFragment();
  indexCell.appendChild(document.createComment(' field:index '));
  indexCell.appendChild(indexLink);

  const cells = [[indexCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'search', cells });
  if (heading) {
    element.replaceWith(heading, block);
  } else {
    element.replaceWith(block);
  }
}
