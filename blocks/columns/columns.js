const OPTION_CLASSES = ['media-text', 'cta-strip', 'images'];

export default function decorate(block) {
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (active.includes('media-text')) {
    // mark text columns so the media/text split can size them independently of the image
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        if (!col.classList.contains('columns-img-col')) col.classList.add('columns-text-col');
      });
    });
  }

  if (active.includes('cta-strip')) {
    // the column holding only buttons/links is the action column, kept at its natural width
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        const text = col.textContent.trim();
        const linkText = [...col.querySelectorAll('a')].map((a) => a.textContent.trim()).join('');
        if (text && text === linkText) col.classList.add('columns-cta-col');
      });
    });
  }
}
