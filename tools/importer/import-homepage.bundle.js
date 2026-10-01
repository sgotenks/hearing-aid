/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".image-fallback img, figure img, picture img, img");
    const headingSrc = element.querySelector('.item-h1, h1, h2, [class*="title"]');
    let heading = null;
    if (headingSrc) {
      if (/^H[1-6]$/.test(headingSrc.tagName)) {
        heading = headingSrc;
      } else {
        heading = document2.createElement("h1");
        heading.textContent = headingSrc.textContent.trim();
      }
    }
    const descSrc = element.querySelector('.copy-text, .m-001-card p, [class*="description"]');
    let description = null;
    if (descSrc && descSrc.textContent.trim()) {
      description = document2.createElement("p");
      description.innerHTML = descSrc.innerHTML.trim();
    }
    const ctaSrcs = [...element.querySelectorAll(".cta-wrapper a, a.cta")].filter((a, i, arr) => arr.indexOf(a) === i);
    const ctas = ctaSrcs.map((a) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = (a.querySelector(".cta-label") || a).textContent.trim();
      const p = document2.createElement("p");
      p.append(link);
      return p;
    });
    if (!image && !heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document2.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(image);
    }
    cells.push([image ? imageCell : ""]);
    const textCell = document2.createDocumentFragment();
    const textNodes = [heading, description, ...ctas].filter(Boolean);
    if (textNodes.length) {
      textCell.appendChild(document2.createComment(" field:text "));
      textNodes.forEach((n) => textCell.appendChild(n));
    }
    cells.push([textNodes.length ? textCell : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-image-overlay.js
  function extractBgUrl(el) {
    if (!el) return null;
    const candidates = [el, ...el.querySelectorAll('[style*="background"]')];
    for (const c of candidates) {
      const style = c.getAttribute && c.getAttribute("style");
      if (style) {
        const m = style.match(/background(?:-image)?\s*:[^;]*url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
        if (m && m[2]) return m[2];
      }
    }
    return null;
  }
  function parse2(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".family-item, .image-box-container-50-50")];
    if (!items.length) {
      items = [...element.querySelectorAll('.row > [class*="col-"]')];
    }
    const cells = [];
    items.forEach((item) => {
      let img = item.querySelector("figure img, .focuspoint-bg img, img");
      if (!img) {
        const bgUrl = extractBgUrl(item.querySelector(".focuspoint-bg") || item);
        if (bgUrl) {
          img = document2.createElement("img");
          img.src = bgUrl;
        }
      }
      const titleEl = item.querySelector("h1, h2, h3, h4, .item-h3, .title--h1");
      if (img && !img.getAttribute("alt") && titleEl) {
        img.setAttribute("alt", titleEl.textContent.trim());
      }
      const textNodes = [];
      if (titleEl) {
        let heading = titleEl;
        if (!/^H[1-6]$/.test(titleEl.tagName)) {
          heading = document2.createElement("h3");
          heading.textContent = titleEl.textContent.trim();
        }
        textNodes.push(heading);
      }
      const descEl = item.querySelector(".simple-text, .copy-text, p");
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.innerHTML = descEl.innerHTML.trim();
        textNodes.push(p);
      }
      const links = [...item.querySelectorAll(".text-container a, .image-box-link a")];
      const ctaLinks = links.length ? links : [...item.querySelectorAll("a[href]")];
      ctaLinks.forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        const p = document2.createElement("p");
        p.append(link);
        textNodes.push(p);
      });
      if (!img && !textNodes.length) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      if (textNodes.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        textNodes.forEach((n) => textCell.appendChild(n));
      }
      cells.push([img ? imageCell : "", textNodes.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", variants: ["image-overlay"], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/search.js
  function parse3(element, { document: document2 }) {
    const headingSrc = element.querySelector('.title-heading, h1, h2, h3, [class*="title"]');
    const input = element.querySelector("input");
    if (!headingSrc && !input) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let heading = null;
    if (headingSrc && headingSrc.textContent.trim()) {
      if (/^H[1-6]$/.test(headingSrc.tagName)) {
        heading = headingSrc;
      } else {
        heading = document2.createElement("h2");
        heading.textContent = headingSrc.textContent.trim();
      }
    }
    const realLink = [...element.querySelectorAll("a[href]")].find((a) => !/^javascript:/i.test(a.getAttribute("href")) && /query-index/.test(a.getAttribute("href")));
    const indexHref = realLink ? realLink.getAttribute("href") : "/query-index.json";
    const indexLink = document2.createElement("a");
    indexLink.href = indexHref;
    indexLink.textContent = indexHref;
    const indexCell = document2.createDocumentFragment();
    indexCell.appendChild(document2.createComment(" field:index "));
    indexCell.appendChild(indexLink);
    const cells = [[indexCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "search", cells });
    if (heading) {
      element.replaceWith(heading, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/columns-media-text.js
  function parse4(element, { document: document2 }) {
    const row = element.querySelector(".row.text-wrapper, .m-006-media-text-container .row, .row");
    let cols = row ? [...row.children].filter((c) => c.tagName === "DIV") : [];
    if (!cols.length) cols = [element];
    const buildMediaCell = (col) => {
      const img = col.querySelector("img");
      return img ? [img] : [];
    };
    const buildTextCell = (col) => {
      const out = [];
      const titleEl = col.querySelector('h1, h2, h3, h4, [class*="title--"], [class*="title"]');
      if (titleEl && titleEl.textContent.trim()) {
        if (/^H[1-6]$/.test(titleEl.tagName)) {
          out.push(titleEl);
        } else {
          const h = document2.createElement("h3");
          h.textContent = titleEl.textContent.trim();
          out.push(h);
        }
      }
      const desc = col.querySelector(".media-text-container-description, .richtext-container");
      if (desc) {
        const paras = [...desc.querySelectorAll(":scope > p, :scope > ul, :scope > ol")];
        if (paras.length) {
          out.push(...paras);
        } else if (desc.textContent.trim()) {
          const p = document2.createElement("p");
          p.innerHTML = desc.innerHTML.trim();
          out.push(p);
        }
      }
      const ctas = [...col.querySelectorAll("a.btn, :scope > a, .cta-wrapper a")].filter((a, i, arr) => arr.indexOf(a) === i && !(desc && desc.contains(a)));
      ctas.forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        const p = document2.createElement("p");
        p.append(link);
        out.push(p);
      });
      return out;
    };
    const rowCells = cols.map((col) => col.querySelector("img") && !col.querySelector('[class*="title"], p, a') ? buildMediaCell(col) : buildTextCell(col));
    const nonEmpty = rowCells.filter((c) => c.length);
    if (!nonEmpty.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cellsRow = rowCells.map((c) => c.length ? c : "");
    while (cellsRow.length < 2) cellsRow.push("");
    const cells = [cellsRow];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", variants: ["media-text"], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta-strip.js
  function parse5(element, { document: document2 }) {
    if (!element.querySelector(".direction-post-container") && element.querySelector("table")) {
      return;
    }
    const container = element.querySelector(".direction-post-container") || element;
    const titleEl = container.querySelector('.title-heading, h1, h2, h3, h4, [class*="title"]');
    const ctaEls = [...container.querySelectorAll("a.direction-btn, a.btn")];
    const ctas = ctaEls.length ? ctaEls : [...container.querySelectorAll("a[href]")].filter((a) => !/^javascript:/i.test(a.getAttribute("href") || ""));
    if (!titleEl && !ctas.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (titleEl && titleEl.textContent.trim()) {
      if (/^H[1-6]$/.test(titleEl.tagName)) {
        textCell.push(titleEl);
      } else {
        const h = document2.createElement("h2");
        h.textContent = titleEl.textContent.trim();
        textCell.push(h);
      }
    }
    const ctaCell = ctas.map((a) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const p = document2.createElement("p");
      p.append(link);
      return p;
    });
    const cells = [[textCell.length ? textCell : "", ctaCell.length ? ctaCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", variants: ["cta-strip"], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-promo-panel.js
  function parse6(element, { document: document2 }) {
    const image = element.querySelector(".m-027-image img, figure img, picture img, img");
    const textRoot = element.querySelector(".m-027-text, .m-027-text-wrapper") || element;
    const headingSrc = textRoot.querySelector('h1, h2, h3, .m-027-headline, [class*="headline"]');
    let heading = null;
    if (headingSrc && headingSrc.textContent.trim()) {
      if (/^H[1-6]$/.test(headingSrc.tagName)) {
        heading = headingSrc;
      } else {
        heading = document2.createElement("h2");
        heading.textContent = headingSrc.textContent.trim();
      }
    }
    const paragraphs = [...textRoot.querySelectorAll("p.m-027-copy, .text-child > p, .richtext-container p")].filter((p, i, arr) => arr.indexOf(p) === i && p.textContent.trim());
    let ctaEls = [...textRoot.querySelectorAll(".m-027-btn-container a, a.btn")];
    ctaEls = ctaEls.filter((a, i, arr) => arr.indexOf(a) === i);
    const ctas = ctaEls.map((a) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const p = document2.createElement("p");
      p.append(link);
      return p;
    });
    if (!image && !heading && !paragraphs.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const imageCell = document2.createDocumentFragment();
    if (image) {
      imageCell.appendChild(document2.createComment(" field:image "));
      imageCell.appendChild(image);
    }
    cells.push([image ? imageCell : ""]);
    const textNodes = [heading, ...paragraphs, ...ctas].filter(Boolean);
    const textCell = document2.createDocumentFragment();
    if (textNodes.length) {
      textCell.appendChild(document2.createComment(" field:text "));
      textNodes.forEach((n) => textCell.appendChild(n));
    }
    cells.push([textNodes.length ? textCell : ""]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", variants: ["promo-panel"], cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  var ICON_BASE = "https://www.amplifon.com/etc.clientlibs/amplifondigitalb2c/components/amplifon-canada/clientlibs/clientlib-base/resources/img/support/";
  function resolveIconUrl(iconEl, document2) {
    if (!iconEl) return null;
    const inline = iconEl.getAttribute("style") || "";
    let m = inline.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
    if (m) return m[2];
    try {
      const view = document2.defaultView;
      if (view && view.getComputedStyle) {
        const bg = view.getComputedStyle(iconEl).backgroundImage || "";
        m = bg.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
        if (m && /\.svg|\.png|\.jpe?g|\.gif|\.webp/i.test(m[2])) return m[2];
      }
    } catch (e) {
    }
    const cls = [...iconEl.classList].find((c) => /^am-icon-support-[a-z]+-dark-(lg|sm)$/.test(c));
    if (cls) {
      const [, name, size] = cls.match(/^am-icon-support-([a-z]+)-dark-(lg|sm)$/);
      return `${ICON_BASE}${name}_support_dark_${size}.svg`;
    }
    return null;
  }
  function parse7(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .get-support__item")];
    if (!items.length) items = [...element.querySelectorAll('.get-support__item, :scope > [class*="col-"]')];
    const cells = [];
    items.forEach((item) => {
      const content = item.querySelector(".get-support__item__content") || item;
      let img = content.querySelector("img");
      const titleEl = content.querySelector('.title--h3, h1, h2, h3, h4, [class*="title"]');
      const titleText = titleEl ? titleEl.textContent.trim() : "";
      if (!img) {
        const iconEl = content.querySelector('figure[class*="am-icon-support"], [class*="am-icon-support"][class*="-lg"], [class*="am-icon-support"]');
        let url = resolveIconUrl(iconEl, document2);
        if (url) {
          if (/\.svg$/i.test(url)) url = `${url}?asset=image`;
          img = document2.createElement("img");
          img.src = url;
          img.alt = titleText;
        }
      }
      const textNodes = [];
      if (titleText) {
        let heading = titleEl;
        if (!/^H[1-6]$/.test(titleEl.tagName)) {
          heading = document2.createElement("h3");
          heading.textContent = titleText;
        }
        textNodes.push(heading);
      }
      const descEl = content.querySelector(".copy-text");
      if (descEl && descEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descEl.textContent.trim();
        textNodes.push(p);
      }
      const ctaEls = [...content.querySelectorAll("a.btn, a[href]")].filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
      if (ctaEls.length) {
        const a = ctaEls[0];
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        const p = document2.createElement("p");
        p.append(link);
        textNodes.push(p);
      }
      if (!img && !textNodes.length) return;
      const imageCell = document2.createDocumentFragment();
      if (img) {
        imageCell.appendChild(document2.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const textCell = document2.createDocumentFragment();
      if (textNodes.length) {
        textCell.appendChild(document2.createComment(" field:text "));
        textNodes.forEach((n) => textCell.appendChild(n));
      }
      cells.push([img ? imageCell : "", textNodes.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", variants: ["icon"], cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/amplifon-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // OneTrust consent SDK root (banner + preference center)
        "#onetrust-banner-sdk",
        // OneTrust banner (child of the SDK root)
        "#onetrust-pc-sdk",
        // OneTrust preference center
        "#ot-sdk-btn-floating",
        // OneTrust floating "Cookie Preferences" button
        ".m-048-cookie-notification-wrapper",
        // site cookie notification strip (x3)
        ".inactivity-banner",
        // "Still there?" inactivity modal
        "#headerModal",
        // "Need help?" modal inside header
        "#modal-error-generic"
        // generic error modal
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        // <header class=" "> containing logo, nav.main-navigation
        "nav.main-navigation",
        ".footer-container",
        // div.container-fluid.footer-container (G14 footer)
        "footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#destination_publishing_iframe_amplifon_0",
        // Adobe ID syncing iframe (demdex)
        "iframe.ot-text-resize",
        // OneTrust text-resize iframe
        'img[src*="demdex.net"]',
        // Adobe Audience Manager pixels
        'img[src*="bat.bing.com"]',
        // Bing UET tracking pixel
        'img[src*="facebook.com/tr"]',
        // Meta pixel
        'img[src*="doubleclick.net"]',
        // Google Ads pixels
        "iframe",
        "link",
        // per-component clientlib <link> tags inside main
        "script",
        "noscript",
        "style"
      ]);
      element.querySelectorAll("[onclick]").forEach((el) => el.removeAttribute("onclick"));
      element.querySelectorAll('img[src*="/content/dam/"]').forEach((img) => {
        const src = img.getAttribute("src");
        const original = src.replace(/\/(?:jcr:content|_jcr_content|jcr%3Acontent)\/renditions\/[^?#]*/i, "");
        if (original !== src) img.setAttribute("src", original);
      });
    }
  }

  // tools/importer/transformers/amplifon-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      let el = null;
      try {
        el = root.querySelector(sel);
      } catch (e) {
        el = null;
      }
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "cards-image-overlay": parse2,
    "search": parse3,
    "columns-media-text": parse4,
    "columns-cta-strip": parse5,
    "hero-promo-panel": parse6,
    "cards-icon": parse7
  };
  var PAGE_TEMPLATE = {
    "name": "homepage",
    "description": "Stage hero with white text panel and one CTA, intro text, four image-overlay benefit tiles, clinic search bar, three media-text rows around a financing CTA strip and a promo panel, support icon cards and two image-overlay teasers",
    "urls": [
      "https://www.amplifon.com/ca/"
    ],
    "blocks": [
      {
        "name": "hero",
        "instances": [
          ".m-001-stage-home-wrapper"
        ]
      },
      {
        "name": "cards-image-overlay",
        "instances": [
          ".m-016-four-family-row",
          ".m-010-teaser-row-wrapper"
        ]
      },
      {
        "name": "search",
        "instances": [
          ".m-014-direction-post-wrapper:has(input)",
          "main > div:nth-of-type(4) .m-014-direction-post-wrapper"
        ]
      },
      {
        "name": "columns-media-text",
        "instances": [
          ".E28-media-text-container-l-33"
        ]
      },
      {
        "name": "columns-cta-strip",
        "instances": [
          ".E22-direction-post .m-014-direction-post-wrapper",
          ".E22-direction-post"
        ]
      },
      {
        "name": "hero-promo-panel",
        "instances": [
          ".E36-teaser-row-full-bleed"
        ]
      },
      {
        "name": "cards-icon",
        "instances": [
          ".get-support-advice-container .get-support-items"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "hero",
        "selector": [
          ".m-001-stage-home-wrapper",
          "main > div:nth-of-type(1)"
        ],
        "style": null,
        "blocks": [
          "hero"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "intro",
        "selector": [
          ".m-008-intro-container-wrapper",
          "main > div:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          ".m-008-intro-container-wrapper h2",
          ".m-008-intro-container-wrapper p"
        ]
      },
      {
        "id": "section-3",
        "name": "benefit-tiles",
        "selector": [
          ".m-016-four-family-row",
          "main > div:nth-of-type(3)"
        ],
        "style": null,
        "blocks": [
          "cards-image-overlay"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "clinic-search",
        "selector": [
          ".m-014-direction-post-wrapper:has(input)",
          "main > div:nth-of-type(4)"
        ],
        "style": "grey",
        "blocks": [
          "search"
        ],
        "defaultContent": []
      },
      {
        "id": "section-5",
        "name": "hearing-aid-types",
        "selector": [
          ".E28-media-text-container-l-33:nth-of-type(2)"
        ],
        "style": null,
        "blocks": [
          "columns-media-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-6",
        "name": "financing-cta",
        "selector": [
          ".E22-direction-post"
        ],
        "style": "grey",
        "blocks": [
          "columns-cta-strip"
        ],
        "defaultContent": []
      },
      {
        "id": "section-7",
        "name": "hearing-test",
        "selector": [
          ".E28-media-text-container-l-33:nth-of-type(4)"
        ],
        "style": null,
        "blocks": [
          "columns-media-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-8",
        "name": "hearing-loss-promo",
        "selector": [
          ".E36-teaser-row-full-bleed"
        ],
        "style": null,
        "blocks": [
          "hero-promo-panel"
        ],
        "defaultContent": []
      },
      {
        "id": "section-9",
        "name": "disclaimer",
        "selector": [
          ".E28-media-text-container-l-33:nth-of-type(6)"
        ],
        "style": null,
        "blocks": [
          "columns-media-text"
        ],
        "defaultContent": []
      },
      {
        "id": "section-10",
        "name": "support-and-advice",
        "selector": [
          ".get-support-advice-container",
          "main > div:nth-of-type(6)"
        ],
        "style": "grey",
        "blocks": [
          "cards-icon"
        ],
        "defaultContent": [
          ".get-support-advice-container h2.title--h2"
        ]
      },
      {
        "id": "section-11",
        "name": "teasers",
        "selector": [
          ".m-010-teaser-row-wrapper",
          "main > div:nth-of-type(7)"
        ],
        "style": "grey",
        "blocks": [
          "cards-image-overlay"
        ],
        "defaultContent": []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        let elements = [];
        try {
          elements = document2.querySelectorAll(selector);
        } catch (e) {
          console.warn(`Invalid selector for block "${blockDef.name}": ${selector}`);
        }
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  function getDocumentPath(originalURL) {
    const rawPath = new URL(originalURL).pathname.replace(/^\/ca(?=\/|$)/, "").replace(/\/$/, "").replace(/\.html?$/, "");
    return WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = getDocumentPath(params.originalURL);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
