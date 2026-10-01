import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const OPTION_CLASSES = ['icon', 'teaser', 'steps', 'image-overlay', 'promo-tile', 'icon-badge'];

/**
 * icon-badge: a card carries a photo plus a small icon. The icon is either a second
 * picture-only cell or the first picture-only paragraph in the body; lift it into a
 * dedicated badge element placed between the image and the body.
 */
function decorateIconBadge(li) {
  const imageCells = [...li.querySelectorAll(':scope > .cards-card-image')];
  let badgePicture = null;
  if (imageCells.length > 1) {
    badgePicture = imageCells[1].querySelector('picture');
    imageCells[1].remove();
  } else {
    const body = li.querySelector(':scope > .cards-card-body');
    const para = body && [...body.querySelectorAll(':scope > p')]
      .find((p) => p.querySelector('picture') && p.textContent.trim() === '');
    if (para) {
      badgePicture = para.querySelector('picture');
      para.remove();
    }
  }
  if (!badgePicture) return;
  const badge = document.createElement('div');
  badge.className = 'cards-card-badge';
  badge.append(badgePicture);
  const image = li.querySelector(':scope > .cards-card-image');
  if (image) image.after(badge);
  else li.prepend(badge);
}

const GENERIC_LINK_TEXT = /^(more|learn more|read more|discover more|find out more|view more|see more|view products)$/i;

/**
 * Generic link labels ("More", "Learn more") repeat across cards that point to
 * different pages. Append the card heading as visually hidden text so each link
 * has a unique, descriptive name for screen readers and search engines.
 */
function describeGenericLinks(li) {
  const heading = li.querySelector('h1, h2, h3, h4, h5, h6');
  if (!heading) return;
  const context = heading.textContent.trim();
  li.querySelectorAll('a').forEach((a) => {
    const text = a.textContent.trim();
    if (!GENERIC_LINK_TEXT.test(text)) return;
    // an aria-label that only repeats the visible text would mask the added context
    const label = a.getAttribute('aria-label');
    if (label && label.trim() !== text) return;
    a.removeAttribute('aria-label');
    if (a.getAttribute('title') === text) a.removeAttribute('title');
    const hidden = document.createElement('span');
    hidden.className = 'visually-hidden';
    hidden.textContent = ` about ${context}`;
    a.append(hidden);
  });
}

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    if (active.includes('icon-badge')) decorateIconBadge(li);
    describeGenericLinks(li);
    ul.append(li);
  });

  const isIcon = active.includes('icon');
  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    // only same-origin images go through the media pipeline: createOptimizedPicture keeps the
    // path alone, so an external image would be requested from this site and 404
    if (url.origin !== window.location.origin) return;
    // vector icons are not transformed by the media pipeline (no width/webp renditions)
    if (/\.svg$/i.test(url.pathname)) return;
    const inBadge = img.closest('.cards-card-badge');
    const width = (isIcon || inBadge) ? '160' : '750';
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
