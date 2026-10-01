/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon.
 * Base block: cards, option class icon
 * (xwalk container; child model "card": image, imageAlt (collapsed), text).
 * Source: https://www.amplifon.com/ca/ (.get-support-advice-container .get-support-items)
 * Generated: 2026-10-01
 *
 * Source: 3 x .get-support__item, each with:
 *   - figure.am-icon-support-{calendar|hearing|phone}-dark-lg (icon rendered via CSS class)
 *   - p.title--h3 title, p.copy-text description, a.btn CTA
 *   - an empty a.link-mobile overlay anchor (ignored)
 * Icon resolution: computed background-image of the icon figure (live page) if available,
 * otherwise the site's support SVG derived from the icon class name
 * (.../clientlib-base/resources/img/support/{name}_support_dark_lg.svg, downloaded by the scraper).
 *
 * Output: one row per card -> [ <!-- field:image --> icon | <!-- field:text --> H3, p, CTA ]
 */
const ICON_BASE = 'https://www.amplifon.com/etc.clientlibs/amplifondigitalb2c/components/amplifon-canada/clientlibs/clientlib-base/resources/img/support/';

function resolveIconUrl(iconEl, document) {
  if (!iconEl) return null;
  // 1. Inline style or computed style background-image
  const inline = iconEl.getAttribute('style') || '';
  let m = inline.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
  if (m) return m[2];
  try {
    const view = document.defaultView;
    if (view && view.getComputedStyle) {
      const bg = view.getComputedStyle(iconEl).backgroundImage || '';
      m = bg.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
      if (m && /\.svg|\.png|\.jpe?g|\.gif|\.webp/i.test(m[2])) return m[2];
    }
  } catch (e) { /* ignore */ }
  // 2. Derive from class name: am-icon-support-{name}-dark-{size}
  const cls = [...iconEl.classList].find((c) => /^am-icon-support-[a-z]+-dark-(lg|sm)$/.test(c));
  if (cls) {
    const [, name, size] = cls.match(/^am-icon-support-([a-z]+)-dark-(lg|sm)$/);
    return `${ICON_BASE}${name}_support_dark_${size}.svg`;
  }
  return null;
}

export default function parse(element, { document }) {
  // Iterate stable block-level item wrappers (not the overlay anchors).
  let items = [...element.querySelectorAll(':scope > .get-support__item')];
  if (!items.length) items = [...element.querySelectorAll('.get-support__item, :scope > [class*="col-"]')];

  const cells = [];

  items.forEach((item) => {
    const content = item.querySelector('.get-support__item__content') || item;

    // ---- Icon / image cell ----
    let img = content.querySelector('img');
    const titleEl = content.querySelector('.title--h3, h1, h2, h3, h4, [class*="title"]');
    const titleText = titleEl ? titleEl.textContent.trim() : '';
    if (!img) {
      const iconEl = content.querySelector('figure[class*="am-icon-support"], [class*="am-icon-support"][class*="-lg"], [class*="am-icon-support"]');
      let url = resolveIconUrl(iconEl, document);
      if (url) {
        // helix-importer's default convertIcons rule turns any <img src="*.svg"> into a
        // ":name:" icon token. The xwalk card "image" field needs a real image reference,
        // so add a neutral query string to keep it an image asset.
        if (/\.svg$/i.test(url)) url = `${url}?asset=image`;
        img = document.createElement('img');
        img.src = url;
        img.alt = titleText;
      }
    }

    // ---- Text cell ----
    const textNodes = [];
    if (titleText) {
      let heading = titleEl;
      if (!/^H[1-6]$/.test(titleEl.tagName)) {
        heading = document.createElement('h3');
        heading.textContent = titleText;
      }
      textNodes.push(heading);
    }
    const descEl = content.querySelector('.copy-text');
    if (descEl && descEl.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = descEl.textContent.trim();
      textNodes.push(p);
    }
    const ctaEls = [...content.querySelectorAll('a.btn, a[href]')]
      .filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
    if (ctaEls.length) {
      const a = ctaEls[0];
      const link = document.createElement('a');
      link.href = a.getAttribute('href');
      link.textContent = a.textContent.trim();
      const p = document.createElement('p');
      p.append(link);
      textNodes.push(p);
    }

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', variants: ['icon'], cells });
  element.replaceWith(block);
}
