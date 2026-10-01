/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero (xwalk model: hero -> image, imageAlt (collapsed), text, classes (skipped)).
 * Source: https://www.amplifon.com/ca/ (.m-001-stage-home-wrapper)
 * Generated: 2026-10-01
 *
 * Source quirk: the stage heading is a styled <span class="item-h1">, not an <h1>.
 * It is re-authored as the page H1.
 *
 * Output (1 column):
 *   Row 1: <!-- field:image --> background image
 *   Row 2: <!-- field:text --> H1, description paragraph, CTA link(s)
 */
export default function parse(element, { document }) {
  // Background image (validated: .image-fallback figure img)
  const image = element.querySelector('.image-fallback img, figure img, picture img, img');

  // Heading: styled span.item-h1 (validated), fallbacks for real headings
  const headingSrc = element.querySelector('.item-h1, h1, h2, [class*="title"]');
  let heading = null;
  if (headingSrc) {
    if (/^H[1-6]$/.test(headingSrc.tagName)) {
      heading = headingSrc;
    } else {
      heading = document.createElement('h1');
      heading.textContent = headingSrc.textContent.trim();
    }
  }

  // Description (validated: .copy-text div) -> paragraph
  const descSrc = element.querySelector('.copy-text, .m-001-card p, [class*="description"]');
  let description = null;
  if (descSrc && descSrc.textContent.trim()) {
    description = document.createElement('p');
    description.innerHTML = descSrc.innerHTML.trim();
  }

  // CTAs (validated: .cta-wrapper a.cta)
  const ctaSrcs = [...element.querySelectorAll('.cta-wrapper a, a.cta')]
    .filter((a, i, arr) => arr.indexOf(a) === i);
  const ctas = ctaSrcs.map((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = (a.querySelector('.cta-label') || a).textContent.trim();
    const p = document.createElement('p');
    p.append(link);
    return p;
  });

  if (!image && !heading && !description) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: image
  const imageCell = document.createDocumentFragment();
  if (image) {
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image);
  }
  cells.push([image ? imageCell : '']);

  // Row 2: text (richtext)
  const textCell = document.createDocumentFragment();
  const textNodes = [heading, description, ...ctas].filter(Boolean);
  if (textNodes.length) {
    textCell.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textCell.appendChild(n));
  }
  cells.push([textNodes.length ? textCell : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
