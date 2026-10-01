import { liftSectionLink, normalizeFragment, textToLinkName } from '../../scripts/fragment.js';

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
 * Builds the header row of a mobile sub-panel: a back button and the panel title.
 * @param {string} backLabel back button label
 * @param {string} title panel title
 * @returns {Element}
 */
function buildSubHeader(backLabel, title) {
  const header = document.createElement('div');
  header.className = 'nav-sub-header';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'nav-back';
  back.textContent = backLabel;
  const heading = document.createElement('p');
  heading.className = 'nav-sub-title';
  heading.textContent = title;
  header.append(back, heading);
  return header;
}

/**
 * Builds a dropdown panel of link columns from a nested list.
 * Each column is a heading link followed by a list of links.
 * @param {Element} list the trigger's nested list
 * @param {string} id panel id
 * @param {string} label the trigger label
 * @returns {Element} panel
 */
function buildPanel(list, id, label) {
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
      const links = colLi.querySelector(':scope > ul');
      if (links) {
        // on mobile the heading opens its links in a sub-panel, so repeat it as the first link
        const overview = document.createElement('li');
        overview.className = 'nav-column-overview';
        const overviewLink = heading.cloneNode(true);
        overviewLink.className = '';
        overview.append(overviewLink);
        links.className = 'nav-column-links';
        links.prepend(overview);
        const sub = document.createElement('div');
        sub.className = 'nav-column-panel';
        sub.append(buildSubHeader(label, heading.textContent.trim()), links);
        col.append(sub);
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
  inner.append(buildSubHeader('Back', label), columns, close);
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
 * Wraps each link's text in a label span so it can sit next to (or under) its icon.
 * @param {Element} container element containing the links
 * @param {string} className label class
 */
function labelLinks(container, className) {
  container.querySelectorAll('a').forEach((a) => {
    const label = document.createElement('span');
    label.className = className;
    [...a.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).forEach((n) => label.append(n));
    a.append(label);
  });
}

/**
 * Closes every open dropdown (and mobile sub-panel) in the nav.
 * @param {Element} nav nav element
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-trigger[aria-expanded="true"]').forEach((t) => {
    t.setAttribute('aria-expanded', 'false');
    t.closest('.nav-item').classList.remove('is-open');
  });
  nav.querySelectorAll('.nav-column.is-open').forEach((col) => {
    col.classList.remove('is-open');
    col.querySelector('.nav-column-heading').setAttribute('aria-expanded', 'false');
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
  const open = force ?? !trigger.closest('.nav-item').classList.contains('is-open');
  closeAllPanels(nav);
  trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  trigger.closest('.nav-item').classList.toggle('is-open', open);
  nav.classList.toggle('has-open-panel', isDesktop.matches && open);
}

/**
 * Opens or closes the mobile menu drawer.
 * @param {Element} nav nav element
 * @param {boolean} [force] force open (true) or closed (false)
 */
function toggleMenu(nav, force) {
  const open = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  nav.querySelector('.nav-hamburger button').setAttribute('aria-expanded', open ? 'true' : 'false');
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
  normalizeFragment(fragment);
  const [brandSection, toolsSection, navSection, ctaSection, quickSection] = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-label', 'Main');

  // row 0: utility links — the label sits in its own span next to the icon
  const tools = wrapSection(toolsSection, 'nav-tools');
  labelLinks(tools, 'nav-tools-label');

  // row 1: logo, nav sections, CTA (+ mobile quick links and hamburger)
  const main = document.createElement('div');
  main.className = 'nav-main';
  const brand = wrapSection(brandSection, 'nav-brand');
  const brandLink = liftSectionLink(brand);
  if (brandLink) textToLinkName(brandLink, 'Amplifon home', (text) => `${text} home`);

  // nav sections: horizontal dropdowns on desktop, a slide-in drawer on mobile
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const drawerClose = document.createElement('button');
  drawerClose.type = 'button';
  drawerClose.className = 'nav-drawer-close';
  drawerClose.setAttribute('aria-label', 'Close menu');
  sections.append(drawerClose);

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
        const panel = buildPanel(list, panelId, label);
        panel.querySelector('.nav-panel-close').addEventListener('click', () => {
          togglePanel(nav, trigger, false);
          trigger.focus();
        });
        panel.querySelector(':scope > .nav-panel-inner > .nav-sub-header .nav-back').addEventListener('click', () => {
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

  // mobile drawer footer: the utility links (except the phone number, which is in the bar)
  const drawerTools = document.createElement('ul');
  drawerTools.className = 'nav-drawer-tools';
  tools.querySelectorAll('a:not([href^="tel:"])').forEach((a) => {
    const item = document.createElement('li');
    item.append(a.cloneNode(true));
    drawerTools.append(item);
  });
  sections.append(drawerTools);

  const cta = wrapSection(ctaSection, 'nav-cta');
  const ctaLink = liftSectionLink(cta);
  if (ctaLink) ctaLink.className = 'button';

  // mobile column headings open their links in a sub-panel; on desktop they are plain links
  const headings = sections.querySelectorAll('.nav-column-heading');
  const syncHeadings = () => headings.forEach((heading) => {
    if (isDesktop.matches) heading.removeAttribute('aria-expanded');
    else heading.setAttribute('aria-expanded', heading.closest('.nav-column').classList.contains('is-open') ? 'true' : 'false');
  });
  syncHeadings();
  headings.forEach((heading) => {
    const col = heading.closest('.nav-column');
    heading.addEventListener('click', (e) => {
      if (isDesktop.matches) return;
      e.preventDefault();
      col.classList.add('is-open');
      heading.setAttribute('aria-expanded', 'true');
    });
    col.querySelector('.nav-column-panel .nav-back')?.addEventListener('click', () => {
      col.classList.remove('is-open');
      heading.setAttribute('aria-expanded', 'false');
      heading.focus();
    });
  });

  // mobile quick links (short labels under icons)
  const quick = wrapSection(quickSection, 'nav-quick');
  labelLinks(quick, 'nav-quick-label');

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-expanded="false">
      <span class="nav-hamburger-icon" aria-hidden="true"></span>
      <span class="nav-hamburger-label">Menu</span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  drawerClose.addEventListener('click', () => {
    toggleMenu(nav, false);
    hamburger.querySelector('button').focus();
  });

  main.append(brand, sections, cta, quick, hamburger);
  nav.append(tools, main);

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => {
    if (nav.getAttribute('aria-expanded') === 'true') toggleMenu(nav, false);
    else closeAllPanels(nav);
  });

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
    syncHeadings();
    navWrapper.classList.remove('nav-up');
  });

  watchScroll(navWrapper);
}
