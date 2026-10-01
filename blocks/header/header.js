// breakpoint at which the desktop header (utility bar + horizontal nav) is used
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment. Local preview serves it from /content, DA/EDS from the root.
 * @returns {Promise<string|null>} the nav HTML
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  return resp.ok ? resp.text() : null;
}

/**
 * Splits a list item into its own text label and its nested list.
 * @param {Element} li list item
 * @returns {{ label: string, list: Element|null }}
 */
function splitItem(li) {
  const list = li.querySelector(':scope > ul');
  const label = [...li.childNodes]
    .filter((n) => n !== list)
    .map((n) => n.textContent)
    .join('')
    .trim();
  return { label, list };
}

/**
 * Builds a dropdown panel of link columns from a nested list.
 * Each column is a heading link followed by a list of links.
 * @param {Element} list the trigger's nested list
 * @param {string} id panel id
 * @returns {Element} panel
 */
function buildPanel(list, id) {
  const panel = document.createElement('div');
  panel.className = 'nav-panel';
  panel.id = id;
  const columns = document.createElement('ul');
  columns.className = 'nav-panel-columns';
  [...list.children].forEach((colLi) => {
    const col = document.createElement('li');
    col.className = 'nav-column';
    const heading = colLi.querySelector(':scope > a');
    if (heading) {
      heading.classList.add('nav-column-heading');
      col.append(heading);
      // on mobile the heading toggles its links, so repeat it as the first link
      const overview = document.createElement('li');
      overview.className = 'nav-column-overview';
      const overviewLink = heading.cloneNode(true);
      overviewLink.className = '';
      overview.append(overviewLink);
      const links = colLi.querySelector(':scope > ul');
      if (links) {
        links.className = 'nav-column-links';
        links.prepend(overview);
        col.append(links);
      }
    }
    columns.append(col);
  });
  const inner = document.createElement('div');
  inner.className = 'nav-panel-inner';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-panel-close';
  close.setAttribute('aria-label', 'Close menu');
  inner.append(columns, close);
  panel.append(inner);
  return panel;
}

/**
 * Builds a nav section (logo, utility links, CTA) as a wrapper around the
 * fragment section's own content.
 * @param {Element} section fragment section
 * @param {string} className wrapper class
 * @returns {Element}
 */
function wrapSection(section, className) {
  const wrapper = document.createElement('div');
  wrapper.className = className;
  if (section) wrapper.append(...section.childNodes);
  return wrapper;
}

/**
 * Closes every open dropdown in the nav.
 * @param {Element} nav nav element
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => {
    t.setAttribute('aria-expanded', 'false');
    t.closest('.nav-item').classList.remove('is-open');
  });
  nav.classList.remove('has-open-panel');
}

/**
 * Opens or closes one dropdown; opening it closes any other.
 * @param {Element} nav nav element
 * @param {Element} trigger trigger button
 * @param {boolean} [force] force open (true) or closed (false)
 */
function togglePanel(nav, trigger, force) {
  const open = force ?? trigger.getAttribute('aria-expanded') !== 'true';
  if (isDesktop.matches) closeAllPanels(nav);
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  trigger.closest('.nav-item').classList.toggle('is-open', open);
  nav.classList.toggle('has-open-panel', isDesktop.matches && open);
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav nav element
 * @param {boolean} [force] force open (true) or closed (false)
 */
function toggleMenu(nav, force) {
  const open = force ?? nav.getAttribute('aria-expanded') !== 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) closeAllPanels(nav);
}

/**
 * Hides the utility bar while scrolling down and shows it again on scroll up.
 * @param {Element} wrapper nav wrapper
 */
function watchScroll(wrapper) {
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = window.scrollY;
      const nav = wrapper.querySelector('nav');
      const keep = nav.classList.contains('has-open-panel') || nav.getAttribute('aria-expanded') === 'true';
      if (!keep && Math.abs(y - lastY) > 5) {
        wrapper.classList.toggle('nav-up', y > lastY && y > 40);
      }
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const html = await fetchNav();
  if (!html) return;
  const fragment = document.createElement('div');
  fragment.innerHTML = html;
  const [brandSection, toolsSection, navSection, ctaSection] = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-label', 'Main');

  // row 0: utility links
  const tools = wrapSection(toolsSection, 'nav-tools');

  // row 1: logo, nav sections, CTA
  const main = document.createElement('div');
  main.className = 'nav-main';
  const brand = wrapSection(brandSection, 'nav-brand');
  const brandLink = brand.querySelector('a');
  if (brandLink && !brandLink.getAttribute('aria-label')) brandLink.setAttribute('aria-label', 'Amplifon home');

  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const navList = navSection?.querySelector(':scope > ul');
  if (navList) {
    navList.className = 'nav-list';
    [...navList.children].forEach((li, i) => {
      const { label, list } = splitItem(li);
      li.className = 'nav-item';
      li.textContent = '';
      if (list) {
        const panelId = `nav-panel-${i}`;
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'nav-trigger';
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-controls', panelId);
        trigger.innerHTML = '<span class="nav-trigger-label"></span><span class="nav-chevron" aria-hidden="true"></span>';
        trigger.querySelector('.nav-trigger-label').textContent = label;
        trigger.addEventListener('click', () => togglePanel(nav, trigger));
        const panel = buildPanel(list, panelId);
        panel.querySelector('.nav-panel-close').addEventListener('click', () => {
          togglePanel(nav, trigger, false);
          trigger.focus();
        });
        li.append(trigger, panel);
        li.classList.add('nav-drop');
      } else {
        li.textContent = label;
      }
    });
    sections.append(navList);
  }

  const cta = wrapSection(ctaSection, 'nav-cta');
  const ctaLink = cta.querySelector('a');
  if (ctaLink) ctaLink.className = 'button';

  // mobile column headings toggle their link lists; on desktop they are plain links
  const headings = sections.querySelectorAll('.nav-column-heading');
  const syncHeadings = () => headings.forEach((heading) => {
    if (isDesktop.matches) heading.removeAttribute('aria-expanded');
    else heading.setAttribute('aria-expanded', heading.closest('.nav-column').classList.contains('is-open') ? 'true' : 'false');
  });
  syncHeadings();
  headings.forEach((heading) => {
    heading.addEventListener('click', (e) => {
      if (isDesktop.matches) return;
      e.preventDefault();
      const col = heading.closest('.nav-column');
      const open = !col.classList.contains('is-open');
      col.classList.toggle('is-open', open);
      heading.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  main.append(brand, sections, cta, hamburger);
  nav.append(tools, main);

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => closeAllPanels(nav));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav, overlay);
  block.append(navWrapper);

  // close dropdowns on outside click and on Escape
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllPanels(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = nav.querySelector('.nav-trigger[aria-expanded="true"]');
    if (open && isDesktop.matches) {
      closeAllPanels(nav);
      open.focus();
    } else if (nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  // reset state when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    sections.querySelectorAll('.nav-column.is-open').forEach((col) => col.classList.remove('is-open'));
    syncHeadings();
    navWrapper.classList.remove('nav-up');
  });

  watchScroll(navWrapper);
}
