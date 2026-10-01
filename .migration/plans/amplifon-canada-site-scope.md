# Amplifon Canada Site Scope Plan

> **Status: Approved, ready to run.** Plan mode is still on, so the scoping can't start yet. Switch to Execute mode and I'll begin with the first checklist item right away.

## Objective
Scope the migration of **https://www.amplifon.com/ca/** to AEM Edge Delivery Services (the project is set up for Universal Editor authoring, with "Hearing Aid" as the target site). The result is a migration scope report covering every discoverable page, how pages group into templates, which blocks they use, and how complex the migration will be overall.

## Approach
1. **Find URLs**: Read the sitemap(s) under `/ca/`. If they're missing or incomplete, crawl the site instead. Limit results to the Canadian section only, and drop duplicates, query-string variants, assets and redirects.
2. **Find templates**: Sample pages from the URL list and group pages that look alike into templates. Likely candidates for a hearing-aid retailer:
   - Homepage
   - Product / hearing-aid detail pages
   - Product category / listing pages
   - Store locator and individual store / clinic pages
   - Hearing-health articles and blog posts
   - Service and landing pages (e.g. free hearing test, booking)
   - Utility pages (contact, about, legal, privacy)
3. **Analyze pages**: Pick one representative page per template. Capture its sections, content, and the block variants it uses.
4. **Catalog blocks**: Combine block variants across all templates. Find blocks that several templates can share, and match them against the existing project and Block Collection blocks.
5. **Report**: Write the scope report with:
   - Page counts per template
   - Block inventory and how often each block is used
   - Header and footer / navigation complexity
   - Dynamic or integrated features (store locator, booking forms, product filters, search)
   - Language versions (English / French)
   - Complexity ratings and recommended migration order

## Assumptions
- Everything under `/ca/` is in scope, including any French (`/ca/fr/`) pages. Language versions are reported separately so you can decide later whether to include them.
- Scoping is read-only analysis. No content is imported and no block code is generated.
- Dynamic features like the store locator, appointment booking and product configurators are flagged as integration items. They aren't treated as blocks.
- If the site has bot protection, the scraper's fallback is used automatically.

## Checklist
- [ ] Confirm the project setup (Universal Editor project, block library source)
- [ ] Find all URLs under https://www.amplifon.com/ca/ (sitemap first, crawl if needed)
- [ ] Clean the URL list (remove duplicates, asset links and redirects; flag language versions)
- [ ] Group the URLs into page templates and record page counts per template
- [ ] Pick a representative page for each template
- [ ] Analyze each representative page (sections, content, block variants)
- [ ] Combine block variants into a site-wide block catalog with usage counts
- [ ] Match catalog blocks to existing project and Block Collection blocks
- [ ] Flag the header/footer setup and dynamic features (store locator, booking, forms, search)
- [ ] Rate complexity per template and for the site overall
- [ ] Write the migration scope report with a recommended migration order
- [ ] Review the report with you and suggest refactors (template merges or splits, shared blocks)

## Deliverables
- A full URL inventory for the Canadian site
- A template catalog with page counts and a representative page for each template
- A block catalog with variants, usage counts and reuse opportunities
- A migration scope report with complexity ratings and a phased migration recommendation

## Next Step
Switch to **Execute mode** to start the scoping. The checklist will run in order and stop for your input only at the final review step.
