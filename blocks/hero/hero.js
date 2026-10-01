const OPTION_CLASSES = ['promo-panel'];

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  if (!active.includes('promo-panel')) return; // default hero stays CSS-only

  // promo-panel: full-bleed background image with a content panel (heading, copy, CTAs)
  const cells = [...block.querySelectorAll(':scope > div > div')];
  cells.forEach((cell) => {
    const hasPicture = !!cell.querySelector('picture');
    const hasText = [...cell.children].some((el) => !el.querySelector('picture') && el.textContent.trim());
    if (hasPicture && !hasText) {
      cell.classList.add('hero-image');
    } else if (hasText) {
      // a picture authored inside the text cell still acts as the background
      if (hasPicture) {
        const pic = cell.querySelector('picture');
        const holder = document.createElement('div');
        holder.className = 'hero-image';
        const para = pic.closest('p');
        holder.append(pic);
        if (para && !para.textContent.trim() && !para.children.length) para.remove();
        cell.before(holder);
      }
      cell.classList.add('hero-panel');
    }
  });
}
