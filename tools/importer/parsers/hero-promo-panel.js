/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-promo-panel.
 * Base block: hero, option class promo-panel
 * (xwalk model: hero -> image, imageAlt (collapsed), text, classes (skipped)).
 * Source: https://www.amplifon.com/ca/ (.E36-teaser-row-full-bleed, M-027 teaser with background)
 * Generated: 2026-10-01
 *
 * Source: .m-027-image figure img (full-bleed photo) + .m-027-text with h2.m-027-headline,
 * p.m-027-copy and .m-027-btn-container anchors (2 CTAs).
 *
 * Output (1 column):
 *   Row 1: <!-- field:image --> background image
 *   Row 2: <!-- field:text --> H2, paragraph, CTA links
 */
export default function parse(element, { document }) {
  const image = element.querySelector('.m-027-image img, figure img, picture img, img');

  const textRoot = element.querySelector('.m-027-text, .m-027-text-wrapper') || element;
  const headingSrc = textRoot.querySelector('h1, h2, h3, .m-027-headline, [class*="headline"]');
  let heading = null;
  if (headingSrc && headingSrc.textContent.trim()) {
    if (/^H[1-6]$/.test(headingSrc.tagName)) {
      heading = headingSrc;
    } else {
      heading = document.createElement('h2');
      heading.textContent = headingSrc.textContent.trim();
    }
  }

  const paragraphs = [...textRoot.querySelectorAll('p.m-027-copy, .text-child > p, .richtext-container p')]
    .filter((p, i, arr) => arr.indexOf(p) === i && p.textContent.trim());

  let ctaEls = [...textRoot.querySelectorAll('.m-027-btn-container a, a.btn')];
  ctaEls = ctaEls.filter((a, i, arr) => arr.indexOf(a) === i);
  const ctas = ctaEls.map((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    return p;
  });

  if (!image && !heading && !paragraphs.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  const imageCell = document.createDocumentFragment();
  if (image) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image);
  }
  cells.push([image ? imageCell : '']);

  const textNodes = [heading, ...paragraphs, ...ctas].filter(Boolean);
  const textCell = document.createDocumentFragment();
  if (textNodes.length) {
    textCell.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textCell.appendChild(n));
  }
  cells.push([textNodes.length ? textCell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', variants: ['promo-panel'], cells });
  element.replaceWith(block);
}
