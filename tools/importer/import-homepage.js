/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsImageOverlayParser from './parsers/cards-image-overlay.js';
import searchParser from './parsers/search.js';
import columnsMediaTextParser from './parsers/columns-media-text.js';
import columnsCtaStripParser from './parsers/columns-cta-strip.js';
import heroPromoPanelParser from './parsers/hero-promo-panel.js';
import cardsIconParser from './parsers/cards-icon.js';

// TRANSFORMER IMPORTS
import amplifonCleanupTransformer from './transformers/amplifon-cleanup.js';
import amplifonSectionsTransformer from './transformers/amplifon-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards-image-overlay': cardsImageOverlayParser,
  'search': searchParser,
  'columns-media-text': columnsMediaTextParser,
  'columns-cta-strip': columnsCtaStripParser,
  'hero-promo-panel': heroPromoPanelParser,
  'cards-icon': cardsIconParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
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

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  amplifonCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [amplifonSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page (deduplicated by element)
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements = [];
      try {
        elements = document.querySelectorAll(selector);
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

/**
 * Map a source URL to a site path. The source site is the Canadian section
 * (/ca/...), which is the root of the target site, so the /ca prefix is dropped
 * and the root maps to /index.
 * @param {string} originalURL - The source page URL
 * @returns {string} Sanitized document path without extension
 */
function getDocumentPath(originalURL) {
  const rawPath = new URL(originalURL).pathname
    .replace(/^\/ca(?=\/|$)/, '')
    .replace(/\/$/, '')
    .replace(/\.html?$/, '');
  return WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Document path
    const path = getDocumentPath(params.originalURL);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
