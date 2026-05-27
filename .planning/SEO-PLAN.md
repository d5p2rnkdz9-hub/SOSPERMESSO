# SOS Permesso — SEO Improvement Plan

*Created 2026-05-27. IT-focus scope.*
*Progress: Phase 1 DONE (a13d54a — sitemap-it complete). Phase 2 DONE (b83217e — title+meta rewrites). Phase 3 DONE (JSON-LD: Organization/WebSite sitewide, FAQPage on 38 permits, BreadcrumbList on permits + 70 doc pages). Phase 0 = user (GSC, ongoing). Phases 4–6 pending.*

## Locked decisions

- **IT-focus.** All SEO investment goes to the Italian site. Translated trees (en, fr, es, tr, bn, ru, ar, ur, fa, zh) stay live and linked but get **no extra SEO work** this round. The ~289 "discovered–not-indexed" pages (mostly translations) are accepted as-is for now — we concentrate authority on one tree that can actually rank rather than spreading thin across eleven Google is declining to index.
- **Typeform fully retired → in-house app.** No Typeform anywhere. CTAs already point to the in-house app; residual references (privacy policies, docs, CLAUDE.md) must be scrubbed.

## Why this plan exists (diagnosis, 2026-05-27)

- ~92% of clicks are **branded** ("sos permesso" 20 clicks). Generic terms ("permesso di soggiorno", "permessi di soggiorno") get impressions but **0 clicks** → ranking on page 2+.
- **289 pages "Rilevata, ma attualmente non indicizzata"** (discovered, not indexed) in GSC — mostly translated trees. Pages not in the index cannot rank.
- Backlink profile is thin/near-zero (low domain authority). Immigration is a **YMYL** topic → Google weights authority/trust heavily.
- **Conclusion:** technical SEO removes the ceiling but does not create traffic. The unlock is authority + discovery (off-site, per `STRATEGIA promozione SOSPERMESSO.md`).

## Current state (verified)

- **Sitemaps**: `sitemap-index.xml` lists 7 langs (it,en,fr,es,tr,bn,ru); `ar/ur/fa/zh` 404. `sitemap-it.xml` = 53 URLs (home + ~11 static + ~40 permits). **~80 document pages (`documenti-*-primo/rinnovo.html`) are in NO sitemap.**
- **On-page (good)**: clean `robots.txt`, 11-lang hreflang in `<head>` (with x-default→IT), canonical, Open Graph, Twitter cards present.
- **Titles (weak)**: permit `<title>` = `Permesso per {tipo}` — missing the search phrase "di soggiorno", no brand suffix. Set in `src/pages/permits.liquid` `eleventyComputed.title`.
- **Structured data**: NONE (no JSON-LD anywhere).
- **In-house app**: live CTAs already point to `testsospermesso.netlify.app/it/...` (tree, contattaci, segnala). App lives on a **separate Netlify domain** — not yet consolidated under sospermesso.it (this is the fragmentation/SEO-authority issue).
- **Stale Typeform refs**: all language `privacy-policy.html` (IT + translations) still describe Typeform as a data processor (GDPR accuracy issue). `CLAUDE.md` still documents Typeform integration points as current. Historical `.planning/` docs reference it (leave as history).
- **Dead code**: `scripts/build-sitemap.js` + `build:sitemap` npm script hardcode 2 langs and old `src/pages/` URLs — superseded by `src/pages/sitemap-*.liquid`. Footgun if run.

---

## Phase 0 — Baseline (you, ~30 min, this week)

1. GSC → Rendimento → enable **Posizione media** + CTR. Sort by Impressioni; screenshot top-20 IT queries with positions. Flag position **8–20** = quick wins.
2. GSC → Sitemap → confirm `sitemap-index.xml` submitted + "Riuscito"; note read-URL count.
3. Record baseline: indexed pages, total clicks, branded vs non-branded split.
4. GSC → Link → export current backlinks (authoritative backlink answer).

## Phase 1 — Technical foundation *(code, IT scope)*

- **1.1** Add the ~80 document pages (`documenti-*-primo/rinnovo`) to `sitemap-it.xml` *(biggest crawl-coverage win)*. Edit `src/pages/sitemap-it.liquid`.
- **1.2** Verify all IT permit + static + (future) hub pages are present in `sitemap-it.xml`.
- **1.3** Delete dead `scripts/build-sitemap.js` + remove `build:sitemap` from `package.json`.
- *Deferred (IT-focus):* create `ar/ur/fa/zh` sitemaps, expand index to 11, fix 11-way sitemap hreflang. Backlog for when authority grows.

## Phase 2 — On-page optimization *(code, IT templates only — `src/pages/`)*

- **2.1** Rewrite IT title templates to lead with the real keyword + brand suffix. Target pattern:
  `Permesso di soggiorno per {tipo}: requisiti, documenti, costi | SOS Permesso`
  Files: `permits.liquid`, `documents-primo.liquid`, `documents-rinnovo.liquid` (IT only).
- **2.2** Rewrite IT meta descriptions — unique, query-shaped; fix generic homepage description.
- **2.3** IT static page titles/descriptions (`database`, `chi-siamo`, `dizionario`, guides).

## Phase 3 — Structured data *(code)*

- **3.1** `FAQPage` JSON-LD on IT permit pages (Q&A sections are a native fit → "People also ask"/rich results).
- **3.2** `Organization` + `WebSite` schema sitewide in `_includes/layouts/base.liquid`.
- **3.3** `BreadcrumbList` on permit/document pages.

## Phase 4 — Content & authority *(code + content, IT)*

- **4.1** Category hub pages. Gap: "permesso per lavoro subordinato" has **no landing page** (split across 3 pathway slugs). Build IT hubs for lavoro / protezione / famiglia / studio / cure, targeting the generic terms and linking down to pathways.
- **4.2** E-E-A-T signals: "ultimo aggiornamento" dates, author = Studio Legale Oltre, citations to interno.gov.it / normattiva, visible comitato scientifico (per strategy doc).
- **4.3** Internal links with descriptive anchor text (full "permesso di soggiorno per …").

## Phase 5 — Off-site authority & discovery *(you lead — per STRATEGIA doc)*

- **5.1 Domain consolidation.** Now only 2 domains: sospermesso.it + `testsospermesso.netlify.app` (in-house app). Bring the app under sospermesso.it (`app.` subdomain or subfolder). Both a friction fix and an SEO authority multiplier.
- **5.2 Backlinks** from sportelli/CAF/ONG/ASGI + university immigration-law departments — the real traffic unlock.
- **5.3** One-pager + QR, social/video engine, ASGI contributo.

## Phase 6 — Typeform retirement cleanup *(correctness — all languages)*

Not SEO, but required by the "no Typeform anywhere" decision. Applies across **all** languages (compliance, not subject to IT-focus):

- **6.1** Update every `privacy-policy.html` (IT + en/fr/es/tr/bn/ru/ar/ur/fa/zh) to remove Typeform as a data processor and describe the in-house app instead. **GDPR accuracy issue** — currently the policy names a processor no longer used.
- **6.2** Update `CLAUDE.md` "Integration Points" + contact/error-reporting sections (still document Typeform as current).
- **6.3** Grep-sweep remaining live source for `typeform` / `form.typeform.com` and replace with in-house app URLs. (Live CTA templates already migrated; verify none remain.)
- **6.4** Once the app is on the final domain (5.1), update all `testsospermesso.netlify.app` links to the canonical domain.

---

## Sequencing

```
Wk 1: Phase 0 (you)  +  Phase 1 (sitemaps)  +  Phase 6.1 (privacy fix)  → resubmit sitemap
Wk 2: Phase 2 (titles/meta) — the click lever
Wk 3: Phase 3 (schema) + Phase 4.1 hubs
Ongoing: 4.2 E-E-A-T  ‖  Phase 5 promotion (you)
Re-measure GSC at wk 4 & wk 8 vs. Phase 0 baseline
```

Phases 1–3 + 6 are implementable in code now (mechanical, reversible, testable locally before push). Expectation: indexing + impressions improve within weeks; non-brand **rankings** follow the off-site authority work (Phase 5) over months.
