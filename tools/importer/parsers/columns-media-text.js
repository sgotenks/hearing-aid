/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media-text.
 * Base block: columns (xwalk columns: no field hints; cells hold default content only).
 * Source: https://www.amplifon.com/ca/ (.E28-media-text-container-l-33)
 * Generated: 2026-10-01
 *
 * Source: .m-006-media-text-container .row.text-wrapper with two column divs:
 *   - .col-full-bleed: figure img (media)
 *   - .text-full-bleed-container: div.title--h3 (styled title), .media-text-container-description
 *     (richtext paragraphs, may contain inline links), a.btn CTA
 * Column order follows the source DOM (handles m-006-text-left / text-right).
 *
 * Output: 1 row, 2 columns -> [ image | H3, paragraph(s), CTA ]
 */
export default function parse(element, { document }) {
  const row = element.querySelector('.row.text-wrapper, .m-006-media-text-container .row, .row');
  let cols = row ? [...row.children].filter((c) => c.tagName === 'DIV') : [];
  if (!cols.length) cols = [element];

  const buildMediaCell = (col) => {
    const img = col.querySelector('img');
    return img ? [img] : [];
  };

  const buildTextCell = (col) => {
    const out = [];
    const titleEl = col.querySelector('h1, h2, h3, h4, [class*="title--"], [class*="title"]');
    if (titleEl && titleEl.textContent.trim()) {
      if (/^H[1-6]$/.test(titleEl.tagName)) {
        out.push(titleEl);
      } else {
        const h = document.createElement('h3');
        h.textContent = titleEl.textContent.trim();
        out.push(h);
      }
    }
    const desc = col.querySelector('.media-text-container-description, .richtext-container');
    if (desc) {
      const paras = [...desc.querySelectorAll(':scope > p, :scope > ul, :scope > ol')];
      if (paras.length) {
        out.push(...paras);
      } else if (desc.textContent.trim()) {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML.trim();
        out.push(p);
      }
    }
    // CTA buttons: direct anchors in the column, not the inline links inside the description
    const ctas = [...col.querySelectorAll('a.btn, :scope > a, .cta-wrapper a')]
      .filter((a, i, arr) => arr.indexOf(a) === i && !(desc && desc.contains(a)));
    ctas.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      const p = document.createElement('p');
      p.append(link);
      out.push(p);
    });
    return out;
  };

  const rowCells = cols.map((col) => (col.querySelector('img') && !col.querySelector('[class*="title"], p, a')
    ? buildMediaCell(col)
    : buildTextCell(col)));

  const nonEmpty = rowCells.filter((c) => c.length);
  if (!nonEmpty.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Columns: 2 cells per row (pad with empty cell if only one column found)
  const cellsRow = rowCells.map((c) => (c.length ? c : ''));
  while (cellsRow.length < 2) cellsRow.push('');
  const cells = [cellsRow];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', variants: ['media-text'], cells });
  element.replaceWith(block);
}
