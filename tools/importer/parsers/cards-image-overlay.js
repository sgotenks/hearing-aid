/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-image-overlay.
 * Base block: cards (xwalk container; child model "card": image, imageAlt (collapsed), text).
 * Source: https://www.amplifon.com/ca/
 * Generated: 2026-10-01
 *
 * Handles two source shapes (instances[] in page-templates.json):
 *   1. .m-016-four-family-row: 4 benefit tiles (.family-item). The photo is set via an inline
 *      CSS background-image on .focuspoint-bg (live page); the scraped DOM may hold an <img>.
 *      Text: h2.item-h3 title, .simple-text description, "More" link.
 *   2. .m-010-teaser-row-wrapper: 2 tiles (.image-box-container-50-50) with figure img,
 *      h3.title--h1 title and an .image-box-link link (chevron icon dropped).
 *
 * Output: one row per card -> [ <!-- field:image --> image | <!-- field:text --> title, desc, CTA ]
 */

function extractBgUrl(el) {
  if (!el) return null;
  const candidates = [el, ...el.querySelectorAll('[style*="background"]')];
  for (const c of candidates) {
    const style = c.getAttribute && c.getAttribute('style');
    if (style) {
      const m = style.match(/background(?:-image)?\s*:[^;]*url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
      if (m && m[2]) return m[2];
    }
  }
  return null;
}

export default function parse(element, { document }) {
  // Iterate the stable block-level item wrappers (not anchors).
  let items = [...element.querySelectorAll('.family-item, .image-box-container-50-50')];
  if (!items.length) {
    items = [...element.querySelectorAll('.row > [class*="col-"]')];
  }

  const cells = [];

  items.forEach((item) => {
    // ---- Image cell ----
    let img = item.querySelector('figure img, .focuspoint-bg img, img');
    if (!img) {
      const bgUrl = extractBgUrl(item.querySelector('.focuspoint-bg') || item);
      if (bgUrl) {
        img = document.createElement('img');
        img.src = bgUrl;
      }
    }
    const titleEl = item.querySelector('h1, h2, h3, h4, .item-h3, .title--h1');
    if (img && !img.getAttribute('alt') && titleEl) {
      img.setAttribute('alt', titleEl.textContent.trim());
    }

    // ---- Text cell ----
    const textNodes = [];
    if (titleEl) {
      let heading = titleEl;
      if (!/^H[1-6]$/.test(titleEl.tagName)) {
        heading = document.createElement('h3');
        heading.textContent = titleEl.textContent.trim();
      }
      textNodes.push(heading);
    }
    const descEl = item.querySelector('.simple-text, .copy-text, p');
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.innerHTML = descEl.innerHTML.trim();
      textNodes.push(p);
    }
    const links = [...item.querySelectorAll('.text-container a, .image-box-link a')];
    const ctaLinks = links.length ? links : [...item.querySelectorAll('a[href]')];
    ctaLinks.forEach((a) => {
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      const p = document.createElement('p');
      p.append(link);
      textNodes.push(p);
    });

    if (!img && !textNodes.length) return;

    const imageCell = document.createDocumentFragment();
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }
    const textCell = document.createDocumentFragment();
    if (textNodes.length) {
      textCell.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => textCell.appendChild(n));
    }
    cells.push([img ? imageCell : '', textNodes.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', variants: ['image-overlay'], cells });
  element.replaceWith(block);
}
