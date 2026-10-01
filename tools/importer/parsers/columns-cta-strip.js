/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta-strip.
 * Base block: columns (xwalk columns: no field hints; cells hold default content only).
 * Source: https://www.amplifon.com/ca/ (.E22-direction-post / its .m-014-direction-post-wrapper)
 * Generated: 2026-10-01
 *
 * Source: .direction-post-container with span.title-heading (styled title) + a.direction-btn CTA.
 * Both instance selectors resolve to the same component (outer E22 wrapper or inner m-014
 * wrapper); the parser works on either.
 *
 * Output: 1 row, 2 columns -> [ H2 heading | CTA link ]
 */
export default function parse(element, { document }) {
  // Both instance selectors target the same component (outer + nested wrapper). If the inner
  // wrapper was already converted into a block table, leave it untouched (no nested block).
  if (!element.querySelector('.direction-post-container') && element.querySelector('table')) {
    return;
  }
  const container = element.querySelector('.direction-post-container') || element;

  const titleEl = container.querySelector('.title-heading, h1, h2, h3, h4, [class*="title"]');
  const ctaEls = [...container.querySelectorAll('a.direction-btn, a.btn')];
  const ctas = ctaEls.length ? ctaEls : [...container.querySelectorAll('a[href]')]
    .filter((a) => !/^javascript:/i.test(a.getAttribute('href') || ''));

  if (!titleEl && !ctas.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const textCell = [];
  if (titleEl && titleEl.textContent.trim()) {
    if (/^H[1-6]$/.test(titleEl.tagName)) {
      textCell.push(titleEl);
    } else {
      const h = document.createElement('h2');
      h.textContent = titleEl.textContent.trim();
      textCell.push(h);
    }
  }

  const ctaCell = ctas.map((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    return p;
  });

  const cells = [[textCell.length ? textCell : '', ctaCell.length ? ctaCell : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', variants: ['cta-strip'], cells });
  element.replaceWith(block);
}
