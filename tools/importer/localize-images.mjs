#!/usr/bin/env node
/* eslint-disable */
/**
 * Fetches every image the imported pages reference under the site DAM path and stores it
 * in the workspace (content/content/dam/<site>/...), where the preview serves it from and
 * where the AEM package upload picks it up as a local asset.
 *
 * Run after the bulk import:
 *   node tools/importer/localize-images.mjs --urls tools/importer/urls-homepage.txt
 *
 * - Source pages (from --urls) are scanned for image URLs; each one is mapped with the same
 *   rules the importer uses (image-paths.js), so a page reference finds its source file.
 * - The original asset is downloaded (DAM: renditions/original, which is public even where
 *   the plain asset URL is not), then large photos are scaled to at most 2560px and
 *   re-encoded so every file stays well under the 20 MB publish limit.
 * - Existing files are kept; pass --force to fetch again.
 * Requires ImageMagick (`convert`) for resizing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseSourceImage, SITE_DAM_PATH } from './image-paths.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT_DIR = path.join(ROOT, 'content');
const MAX_EDGE = 2560;
const MAX_BYTES = 20 * 1024 * 1024;
const RESIZE_ABOVE_BYTES = 2 * 1024 * 1024;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

const args = process.argv.slice(2);
const urlsFile = args[args.indexOf('--urls') + 1];
const force = args.includes('--force');
if (!args.includes('--urls') || !urlsFile) {
  console.error('Usage: node tools/importer/localize-images.mjs --urls <urls.txt> [--force]');
  process.exit(1);
}

const decodeEntities = (s) => s.replace(/&amp;/g, '&').replace(/&#x2F;/gi, '/').replace(/\\\//g, '/');

/**
 * damPath -> source URL, from every image URL found in the source pages and in their
 * same-origin stylesheets (icons such as the support SVGs only exist as CSS url()s).
 */
async function scanSourcePages(pageUrls) {
  const map = new Map();
  const add = (url) => {
    const parsed = parseSourceImage(url);
    if (parsed && !map.has(parsed.damPath)) map.set(parsed.damPath, parsed);
  };
  const pattern = /(?:https?:)?(?:\/\/www\.amplifon\.com)?\/(?:content\/dam|etc\.clientlibs)\/[^"'\s()<>\\]+/g;
  const scannedCss = new Set();
  for (const pageUrl of pageUrls) {
    const res = await fetch(pageUrl, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`${pageUrl}: HTTP ${res.status}`);
    const html = decodeEntities(await res.text());
    for (const match of html.matchAll(pattern)) add(match[0].replace(/^\/\//, 'https://'));

    const cssUrls = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)]
      .map((m) => m[0].match(/href="([^"]+)"/)?.[1])
      .filter(Boolean)
      .map((href) => new URL(href, pageUrl))
      .filter((u) => u.origin === new URL(pageUrl).origin && !scannedCss.has(u.href));
    for (const cssUrl of cssUrls) {
      scannedCss.add(cssUrl.href);
      const css = await fetch(cssUrl, { headers: { 'User-Agent': UA } }).then((r) => (r.ok ? r.text() : ''));
      for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
        if (!m[2].startsWith('data:')) add(new URL(m[2], cssUrl).href);
      }
    }
  }
  return map;
}

/** every site DAM path referenced by the imported pages */
function referencedDamPaths() {
  const refs = new Set();
  const pattern = new RegExp(`${SITE_DAM_PATH.replace(/[/-]/g, '\\$&')}/[^"'\\s)<>]+`, 'g');
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith('.html')) continue;
    const html = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    for (const match of html.matchAll(pattern)) refs.add(decodeURI(match[0]));
  }
  return refs;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://www.amplifon.com/' }, redirect: 'manual' });
  if (!res.ok) return null;
  const type = res.headers.get('content-type') || '';
  if (!type.startsWith('image/')) return null;
  return Buffer.from(await res.arrayBuffer());
}

function webSize(file) {
  if (/\.svg$/i.test(file)) return;
  const [w, h] = execFileSync('identify', ['-format', '%w %h', `${file}[0]`]).toString().split(' ').map(Number);
  const bytes = fs.statSync(file).size;
  if (Math.max(w, h) <= MAX_EDGE && bytes <= RESIZE_ABOVE_BYTES) return;
  const jpeg = /\.jpe?g$/i.test(file);
  execFileSync('convert', [file, '-auto-orient', '-resize', `${MAX_EDGE}x${MAX_EDGE}>`, '-strip',
    ...(jpeg ? ['-colorspace', 'sRGB', '-interlace', 'JPEG', '-sampling-factor', '4:2:0', '-quality', '85'] : []),
    file]);
}

const pageUrls = fs.readFileSync(urlsFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);
const sources = await scanSourcePages(pageUrls);
const refs = referencedDamPaths();
let failed = 0;

for (const damPath of [...refs].sort()) {
  const target = path.join(CONTENT_DIR, damPath);
  if (!force && fs.existsSync(target)) {
    console.log(`kept      ${damPath}`);
    continue;
  }
  const source = sources.get(damPath);
  if (!source) {
    console.log(`NO SOURCE ${damPath}`);
    failed += 1;
    continue;
  }
  const candidates = source.kind === 'dam'
    ? [`${source.sourceUrl}/jcr:content/renditions/original`, source.sourceUrl]
    : [source.sourceUrl];
  let data = null;
  for (const url of candidates) {
    data = await download(url);
    if (data) break;
  }
  if (!data) {
    console.log(`FAILED    ${damPath} (${source.sourceUrl})`);
    failed += 1;
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
  webSize(target);
  const size = fs.statSync(target).size;
  if (size > MAX_BYTES) {
    console.log(`TOO LARGE ${damPath} (${(size / 1048576).toFixed(1)} MB)`);
    failed += 1;
    continue;
  }
  console.log(`saved     ${damPath} (${(size / 1048576).toFixed(2)} MB)`);
}

console.log(`\n${refs.size} referenced image(s), ${failed} problem(s)`);
process.exit(failed ? 1 : 0);
