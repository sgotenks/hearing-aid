import { liftSectionLink, normalizeFragment, textToLinkName } from '../../scripts/fragment.js';

/**
 * Fetches the footer fragment. Local preview serves it from /content, DA/EDS from the root.
 * @returns {Promise<string|null>} the footer HTML
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  return resp.ok ? resp.text() : null;
}

/**
 * Wraps a fragment section in a full-width band with a centred inner container.
 * @param {Element} section fragment section
 * @param {string} className band class
 * @returns {Element} band
 */
function buildBand(section, className) {
  const band = document.createElement('div');
  band.className = `footer-band ${className}`;
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  if (section) inner.append(...section.childNodes);
  band.append(inner);
  return band;
}

// below this width the link columns collapse into accordions
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Turns a list of "heading text + nested link list" items into link columns.
 * On mobile each heading is an accordion toggle (one column open at a time).
 * @param {Element} band link-columns band
 */
function decorateColumns(band) {
  const list = band.querySelector(':scope > .footer-inner > ul');
  if (!list) return;
  list.className = 'footer-columns';
  const toggles = [];
  [...list.children].forEach((li, i) => {
    li.className = 'footer-column';
    const links = li.querySelector(':scope > ul');
    const label = [...li.childNodes].filter((n) => n !== links).map((n) => n.textContent).join('').trim();
    li.textContent = '';
    const heading = document.createElement('p');
    heading.className = 'footer-column-heading';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'footer-column-toggle';
    toggle.textContent = label;
    heading.append(toggle);
    li.append(heading);
    if (links) {
      links.className = 'footer-column-links';
      links.id = `footer-column-${i}`;
      toggle.setAttribute('aria-controls', links.id);
      li.append(links);
    }
    toggles.push(toggle);
  });

  const setOpen = (toggle, open) => {
    toggle.closest('.footer-column').classList.toggle('is-open', open);
    if (!isDesktop.matches) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      if (isDesktop.matches) return;
      const open = !toggle.closest('.footer-column').classList.contains('is-open');
      toggles.forEach((t) => setOpen(t, false));
      setOpen(toggle, open);
    });
  });

  // headings are plain, non-focusable labels on desktop and accordion toggles on mobile
  const sync = () => toggles.forEach((toggle) => {
    toggle.closest('.footer-column').classList.remove('is-open');
    if (isDesktop.matches) {
      toggle.removeAttribute('aria-expanded');
      toggle.tabIndex = -1;
    } else {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.removeAttribute('tabindex');
    }
  });
  sync();
  isDesktop.addEventListener('change', sync);
}

/**
 * Wraps each link's text in a label span so it can sit next to its icon.
 * @param {Element} container element containing the links
 */
function labelLinks(container) {
  container.querySelectorAll('a').forEach((a) => {
    const text = [...a.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    if (!text.length) return;
    const label = document.createElement('span');
    label.className = 'footer-link-label';
    text.forEach((n) => label.append(n));
    a.append(label);
  });
}

/**
 * Opens the cookie consent preference centre when it is available; otherwise the
 * link falls back to its page (the cookie policy).
 * @param {Element} container element containing the legal links
 */
function decorateConsentLink(container) {
  container.querySelectorAll('a[href$="#preferences"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (window.OneTrust?.ToggleInfoDisplay) {
        e.preventDefault();
        window.OneTrust.ToggleInfoDisplay();
      }
    });
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const html = await fetchFooter();
  if (!html) return;
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  normalizeFragment(fragment);
  const [topSection, columnsSection, socialSection, legalSection] = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const top = buildBand(topSection, 'footer-top');
  const inner = top.querySelector(':scope > .footer-inner');
  // the logo comes first (a one-item list, so AEM keeps its image), then the corporate links
  const [logoItem, corporate] = inner.children;
  const logo = document.createElement('div');
  logo.append(logoItem);
  const logoLink = liftSectionLink(logo);
  if (logoLink) {
    textToLinkName(logoLink, 'Amplifon home', (text) => `${text} home`);
    logo.firstElementChild.classList.add('footer-logo');
    inner.prepend(logo.firstElementChild);
  }
  corporate?.classList.add('footer-corporate');
  top.querySelectorAll('.footer-corporate > li').forEach((li) => {
    if (li.querySelector('img')) li.classList.add('footer-locale');
  });

  const columns = buildBand(columnsSection, 'footer-links');
  decorateColumns(columns);

  const social = buildBand(socialSection, 'footer-social');
  const legal = buildBand(legalSection, 'footer-legal');
  [top, social].forEach(labelLinks);
  decorateConsentLink(legal);

  const footer = document.createElement('div');
  footer.className = 'footer-wrapper-inner';
  footer.append(top, columns, social, legal);
  block.append(footer);
}
