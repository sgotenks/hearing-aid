/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Amplifon Canada site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html (https://www.amplifon.com/ca/).
 *
 * NOTE: The four benefit tiles (.m-016-four-family-row) use inline CSS
 * background-image for their photos. That is intentionally left untouched here
 * and handled by the cards-image-overlay block parser.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / modals / consent UI that can interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk', // OneTrust consent SDK root (banner + preference center)
      '#onetrust-banner-sdk', // OneTrust banner (child of the SDK root)
      '#onetrust-pc-sdk', // OneTrust preference center
      '#ot-sdk-btn-floating', // OneTrust floating "Cookie Preferences" button
      '.m-048-cookie-notification-wrapper', // site cookie notification strip (x3)
      '.inactivity-banner', // "Still there?" inactivity modal
      '#headerModal', // "Need help?" modal inside header
      '#modal-error-generic', // generic error modal
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: header/nav, footer.
    WebImporter.DOMUtils.remove(element, [
      'header', // <header class=" "> containing logo, nav.main-navigation
      'nav.main-navigation',
      '.footer-container', // div.container-fluid.footer-container (G14 footer)
      'footer',
    ]);

    // Tracking / non-content leftovers.
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_amplifon_0', // Adobe ID syncing iframe (demdex)
      'iframe.ot-text-resize', // OneTrust text-resize iframe
      'img[src*="demdex.net"]', // Adobe Audience Manager pixels
      'img[src*="bat.bing.com"]', // Bing UET tracking pixel
      'img[src*="facebook.com/tr"]', // Meta pixel
      'img[src*="doubleclick.net"]', // Google Ads pixels
      'iframe',
      'link', // per-component clientlib <link> tags inside main
      'script',
      'noscript',
      'style',
    ]);

    // Strip inline event handlers.
    element.querySelectorAll('[onclick]').forEach((el) => el.removeAttribute('onclick'));
  }
}
