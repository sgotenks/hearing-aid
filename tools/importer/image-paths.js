/* eslint-disable */
/**
 * Image path rules shared by the importer (page content) and localize-images.mjs (files).
 *
 * Every source image is stored once in the site's DAM folder and referenced by that path:
 *   https://www.amplifon.com/content/dam/content-factory/photos/Lifestyle/a.jpg/jcr:content/renditions/cq5dam.web.1120.1120.jpeg
 *     -> /content/dam/hearing-aid/content-factory/photos/lifestyle/a.jpg
 *   https://www.amplifon.com/etc.clientlibs/.../img/support/phone_support_dark_lg.svg?asset=image
 *     -> /content/dam/hearing-aid/icons/phone_support_dark_lg.svg
 *
 * The preview serves /content/dam/<site>/... from the workspace (content/content/dam/<site>/...),
 * and the AEM package maps the same path 1:1 to an Assets file, so no rendition or space-encoded
 * segment ever becomes a folder in Assets. Folders are lowercase (as AEM names them); characters
 * AEM does not allow in names become "-".
 */
export const SOURCE_ORIGIN = 'https://www.amplifon.com';
export const SITE_DAM_PATH = '/content/dam/hearing-aid';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|avif)$/i;
const RENDITION = /\/(?:jcr:content|_jcr_content|jcr%3Acontent)\/renditions\/[^?#]*$/i;

const cleanSegment = (segment) => decodeURIComponent(segment)
  .trim()
  .replace(/[\s*/:[\]|#%{}?"^;+&]+/g, '-');

/**
 * Parses a source image reference into its original asset URL and the site DAM path.
 * @param {string} src image URL (absolute, protocol-relative or root-relative)
 * @returns {{ sourceUrl: string, damPath: string, kind: 'dam'|'static' } | null}
 */
export function parseSourceImage(src) {
  if (!src) return null;
  let url;
  try {
    url = new URL(src, SOURCE_ORIGIN);
  } catch (e) {
    return null;
  }
  if (url.origin !== SOURCE_ORIGIN) return null;
  const path = url.pathname.replace(RENDITION, '');
  if (!IMAGE_EXT.test(path)) return null;

  if (path.startsWith('/content/dam/') && !path.startsWith(`${SITE_DAM_PATH}/`)) {
    const segments = path.slice('/content/dam/'.length).split('/').map(cleanSegment);
    const file = segments.pop();
    return {
      sourceUrl: `${SOURCE_ORIGIN}${path}`,
      damPath: `${SITE_DAM_PATH}/${segments.map((s) => s.toLowerCase()).join('/')}/${file}`,
      kind: 'dam',
    };
  }
  if (path.startsWith('/etc.clientlibs/')) {
    const file = cleanSegment(path.split('/').pop());
    return { sourceUrl: `${SOURCE_ORIGIN}${path}`, damPath: `${SITE_DAM_PATH}/icons/${file}`, kind: 'static' };
  }
  return null;
}

/**
 * Points every source image in the element at its site DAM path.
 * Run it after WebImporter.rules.adjustImageUrls, which makes image URLs absolute again.
 * @param {Element} element imported page body
 */
export function localizeImageReferences(element) {
  element.querySelectorAll('img[src]').forEach((img) => {
    const parsed = parseSourceImage(img.getAttribute('src'));
    if (parsed) img.setAttribute('src', parsed.damPath);
  });
}
