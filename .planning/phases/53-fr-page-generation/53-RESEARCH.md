# Phase 53: FR Page Generation - Research

**Researched:** 2026-02-18
**Domain:** 11ty static site generation, multilingual Liquid templates, French page pipeline
**Confidence:** HIGH

## Summary

Phase 53 replicates the EN pipeline (implemented in Phase 49) for French. The EN pipeline is fully operational and provides an exact template: three Liquid pagination templates, a collection of static pages, and updates to four infrastructure files. All FR data files already exist from Phase 52 (`_data/permitsFr.js` and `_data/documentsFr.js`), so Phase 53 is primarily file creation and infrastructure wiring.

The key complexity is the DuplicatePermalinkOutputError blocker: 66 untracked EN static `permesso-*.html` files in `en/src/pages/` coexist with `permits-en.liquid`. These static files are confirmed present (66 counted). The `eleventy.config.mjs` already has a safety net for `documenti-*` EN files but NOT for `permesso-*` EN files. This must be fixed before FR permit generation will work reliably — and fixing it for EN also prevents the same issue for FR.

The FR static pages directory (`fr/`) does not yet exist. All 9 required FR static pages must be created from scratch, translated into French, following the EN pattern exactly.

**Primary recommendation:** Fix the EN `permesso-*` blocker first, then create FR files in the same pass. The fix is a 6-line addition to `eleventy.config.mjs` mirroring the existing EN `documenti-*` safety net.

## Standard Stack

This phase uses only existing project infrastructure — no new libraries.

### Core (already in project)
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| 11ty | 3.1.2 | Static site generation with Liquid pagination | Already project standard |
| Liquid | (11ty built-in) | Template language for page generation | Already project standard |
| Node.js | (existing) | Data file execution environment | Already project standard |
| Notion API | (existing) | FR data already fetched by `permitsFr.js` / `documentsFr.js` | Already project standard |

### No new dependencies
FR page generation requires zero new npm packages. All tooling reuses what EN established.

**Installation:** None required.

## Architecture Patterns

### File Layout (EN as model, FR to replicate)

```
en/                              # EXISTS
  index.html                     # EN homepage (static, layout: base.liquid)
  src/pages/
    pages.11tydata.js            # permalink: en/${fileSlug}.html
    pages.11tydata.json          # permalink: {{ page.filePathStem }}.html (secondary)
    permits-en.liquid            # pagination over permitsEn → en/permesso-{slug}.html
    documents-primo-en.liquid    # pagination over documentsEn.primo → en/documenti-{slug}-primo.html
    documents-rinnovo-en.liquid  # pagination over documentsEn.rinnovo → en/documenti-{slug}-rinnovo.html
    database.html                # static listing
    documenti-questura.html      # static listing
    chi-siamo.html               # about
    [7 more static pages]        # aiuto-legale, controlla-permesso, etc.

fr/                              # TO CREATE
  index.html
  src/pages/
    pages.11tydata.js            # permalink: fr/${fileSlug}.html
    permits-fr.liquid            # pagination over permitsFr → fr/permesso-{slug}.html
    documents-primo-fr.liquid    # pagination over documentsFr.primo → fr/documenti-{slug}-primo.html
    documents-rinnovo-fr.liquid  # pagination over documentsFr.rinnovo → fr/documenti-{slug}-rinnovo.html
    database.html                # static listing (FR translated)
    documenti-questura.html      # static listing (FR translated)
    chi-siamo.html               # about (FR translated)
```

### Pattern 1: Pagination Template for Permits

Each FR pagination template is a near-identical copy of its EN counterpart with these substitutions:

| EN value | FR value |
|----------|---------|
| `data: permitsEn` | `data: permitsFr` |
| `alias: permit` | `alias: permit` (same) |
| `permalink: "en/permesso-{{ permit.slug }}.html"` | `permalink: "fr/permesso-{{ permit.slug }}.html"` |
| `lang: en` | `lang: fr` |
| English UI strings | French UI strings |
| `/en/database.html` links | `/fr/database.html` links |
| `/en/documenti-*` links | `/fr/documenti-*` links |

**Example front matter for `fr/src/pages/permits-fr.liquid`:**
```yaml
---
pagination:
  data: permitsFr
  size: 1
  alias: permit
permalink: "fr/permesso-{{ permit.slug }}.html"
layout: layouts/base.liquid
title: "Permis pour {{ permit.tipo }}"
lang: fr
description: "Permis de séjour pour {{ permit.tipo }} - informations, conditions, documents et démarches"
eleventyExcludeFromCollections: true
---
```

### Pattern 2: Pagination Template for Documents (layout: false)

Document templates use `layout: false` and include full HTML. FR follows the same pattern:

```yaml
---
pagination:
  data: documentsFr.primo
  size: 1
  alias: doc
permalink: "fr/documenti-{{ doc.slug }}-primo.html"
layout: false
lang: fr
eleventyExcludeFromCollections: true
---
```

Key FR UI string translations for document templates:

| EN | FR |
|----|----|
| "Documents for first issue" | "Documents pour premier titre" |
| "Documents for renewal" | "Documents pour renouvellement" |
| "Required documents" | "Documents requis" |
| "Check off the documents..." | "Cochez les documents..." |
| "Completed:" | "Complété :" |
| "may vary by Police office" | "peut varier selon la Questura" |
| "Submit via postal KIT" | "Déposer via kit postal" |
| "Bring documents to the Police Headquarters" | "Apporter les documents à la Questura" |
| "Postal payment slip" | "Bon de paiement postal" |
| "Revenue stamp" | "Timbre fiscal" |
| "Postal kit" | "Kit postal" |
| "Total" | "Total" |
| "See also: Renewal" | "Voir aussi : Renouvellement" |
| "See also: First Issue" | "Voir aussi : Premier titre" |
| "View the permit" | "Voir le permis" |
| "Note: Required documents may vary..." | "Remarque : Les documents requis peuvent varier..." |
| "Additional document information" | "Informations supplémentaires sur les documents" |
| "How much does it cost?" | "Combien ça coûte ?" |
| "to pay at the Post Office" | "à payer à la Poste" |
| "to buy at a tobacco shop" | "à acheter chez un buraliste" |
| "to buy at the Post Office" | "à acheter à la Poste" |
| "Remember: The renewal application..." | "Rappel : La demande de renouvellement..." |
| "Warning: Renewal of the job-seeking permit..." | "Attention : Le renouvellement du permis..." |

The localStorage checklist key must use `fr` suffix instead of `en`:
- EN: `{{ doc.slug }}-primo-en`
- FR: `{{ doc.slug }}-primo-fr`

Also update the `data-permit` attribute and all checkbox IDs to use `fr` suffix.

### Pattern 3: Static Pages `pages.11tydata.js`

```javascript
// fr/src/pages/pages.11tydata.js
module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      if (data.pagination) return data.permalink;
      return `fr/${data.page.fileSlug}.html`;
    }
  }
};
```

### Pattern 4: Infrastructure File Updates

**`eleventy.config.mjs` — three additions:**

1. Safety net for FR `documenti-*` static files (same as EN block at lines 46-60):
```javascript
// Safety net for FR document pages
const frPagesDir = path.join(process.cwd(), 'fr', 'src', 'pages');
try {
  const frFiles = fs.readdirSync(frPagesDir);
  const frDocFiles = frFiles.filter(f =>
    f.startsWith('documenti-') && f.endsWith('.html') && f !== 'documenti-questura.html'
  );
  for (const file of frDocFiles) {
    eleventyConfig.ignores.add(`fr/src/pages/${file}`);
  }
  if (frDocFiles.length > 0) {
    console.log(`[eleventy] Ignoring ${frDocFiles.length} static FR document files (replaced by Liquid templates)`);
  }
} catch (e) {}
```

2. Safety net for EN `permesso-*` static files (BLOCKER FIX — fixes the DuplicatePermalinkOutputError):
```javascript
// Safety net for EN static permit pages (passthrough copy wins over liquid template)
try {
  const enFiles = fs.readdirSync(enPagesDir);
  const enPermitFiles = enFiles.filter(f =>
    f.startsWith('permesso-') && f.endsWith('.html')
  );
  for (const file of enPermitFiles) {
    eleventyConfig.ignores.add(`en/src/pages/${file}`);
  }
  if (enPermitFiles.length > 0) {
    console.log(`[eleventy] Ignoring ${enPermitFiles.length} static EN permit files (replaced by Liquid templates)`);
  }
} catch (e) {}
```

**`_data/nav.js` — add `fr` entry:**
```javascript
fr: {
  dropdowns: [
    {
      label: "Base de données",
      href: "/fr/database.html",
      items: [
        { label: "Tous les permis", href: "/fr/database.html" },
        { label: "Documents pour la Questura", href: "/fr/documenti-questura.html" }
      ]
    },
    {
      label: "Guides",
      href: "/fr/dizionario.html",
      items: [
        { label: "Protection internationale", href: "/fr/protezione-internazionale.html" },
        { label: "Regroupement familial", href: "/fr/permesso-ricongiungimento-familiare.html" },
        { label: "Dictionnaire", href: "/fr/dizionario.html" }
      ]
    },
    {
      label: "Test",
      href: "https://form.typeform.com/to/kt7P9Ejk",
      external: true,
      items: [
        { label: "Puis-je OBTENIR un permis ?", href: "https://form.typeform.com/to/kt7P9Ejk", external: true },
        { label: "Puis-je CONVERTIR ?", href: "https://form.typeform.com/to/oc9jhdkJ", external: true },
        { label: "Puis-je RENOUVELER ?", href: "https://form.typeform.com/to/R7HY8nBp", external: true }
      ]
    },
    {
      label: "Collaborer",
      href: "https://form.typeform.com/to/USx16QN3",
      external: true,
      items: [
        { label: "Aider", href: "https://form.typeform.com/to/USx16QN3", external: true },
        { label: "Signaler une erreur", href: "https://form.typeform.com/to/FsqvzdXI", external: true },
        { label: "Donner un retour", href: "https://form.typeform.com/to/USx16QN3", external: true }
      ]
    }
  ]
}
```

**`_data/footer.js` — add `fr` entry:**
```javascript
fr: {
  links: [
    { label: "Le Projet", href: "/fr/il-progetto.html" },
    { label: "Qui sommes-nous", href: "/fr/chi-siamo.html" },
    { label: "Confidentialité", href: "/fr/privacy-policy.html" }
  ]
}
```

**`_includes/components/header.liquid` — add `fr` logo link condition:**
```liquid
<a href="{% if lang == 'fr' %}{{ '/fr/' | url }}{% elsif lang == 'en' %}{{ '/en/' | url }}{% else %}{{ '/' | url }}{% endif %}" class="logo">
```

**`_includes/components/language-switcher.liquid` — show FR as current language:**
```liquid
{% if lang == 'fr' %}
<span id="current-language">FR 🇫🇷</span>
{% elsif lang == 'en' %}
<span id="current-language">EN 🇬🇧</span>
{% else %}
<span id="current-language">IT 🇮🇹</span>
{% endif %}
```

**`src/scripts/app.js` — enable FR in language switcher logic:**

Two changes required:

1. Uncomment FR path detection in `detectLanguage()`:
```javascript
if (path.startsWith('/fr/') || path === '/fr') return 'fr';
```

2. Replace the "only IT and EN" guard with FR support:
```javascript
// Before:
if (selectedLang !== 'it' && selectedLang !== 'en') {
  alert('This language is coming soon!...');
  return;
}
// After: remove this guard entirely (or extend to include 'fr')
```

3. Add FR path switching logic alongside the existing IT/EN logic:
```javascript
const isCurrentlyFrench = currentPath.startsWith('/fr/') || currentPath === '/fr';
const isCurrentlyEnglish = currentPath.startsWith('/en/') || currentPath === '/en';

if (selectedLang === 'fr') {
  if (isCurrentlyFrench) return;
  if (currentPath === '/' || currentPath === '/index.html') {
    newPath = '/fr/';
  } else if (isCurrentlyEnglish) {
    newPath = '/fr' + currentPath.replace(/^\/en/, '');
  } else {
    newPath = '/fr' + currentPath;
  }
} else if (selectedLang === 'en') {
  if (isCurrentlyEnglish) return;
  if (currentPath === '/' || currentPath === '/index.html') {
    newPath = '/en/';
  } else if (isCurrentlyFrench) {
    newPath = '/en' + currentPath.replace(/^\/fr/, '');
  } else {
    newPath = '/en' + currentPath;
  }
} else if (selectedLang === 'it') {
  if (!isCurrentlyEnglish && !isCurrentlyFrench) return;
  if (isCurrentlyEnglish) {
    newPath = currentPath === '/en/' || currentPath === '/en' || currentPath === '/en/index.html'
      ? '/' : currentPath.replace(/^\/en/, '');
  } else {
    newPath = currentPath === '/fr/' || currentPath === '/fr' || currentPath === '/fr/index.html'
      ? '/' : currentPath.replace(/^\/fr/, '');
  }
}
```

**`_includes/layouts/base.liquid` — add FR hreflang:**

The current hreflang logic handles only IT/EN. Needs extension for FR:
```liquid
{%- assign urlPrefix = page.url | slice: 0, 4 -%}
{%- if urlPrefix == "/en/" -%}
  {%- assign itUrl = page.url | replace_first: "/en/", "/" -%}
  {%- assign enUrl = page.url -%}
  {%- assign frUrl = "/fr" | append: itUrl -%}
{%- elsif urlPrefix == "/fr/" -%}
  {%- assign itUrl = page.url | replace_first: "/fr/", "/" -%}
  {%- assign enUrl = "/en" | append: itUrl -%}
  {%- assign frUrl = page.url -%}
{%- else -%}
  {%- assign itUrl = page.url -%}
  {%- assign enUrl = "/en" | append: page.url -%}
  {%- assign frUrl = "/fr" | append: page.url -%}
{%- endif -%}
<link rel="alternate" hreflang="it" href="{{ site.url }}{{ itUrl }}">
<link rel="alternate" hreflang="en" href="{{ site.url }}{{ enUrl }}">
<link rel="alternate" hreflang="fr" href="{{ site.url }}{{ frUrl }}">
<link rel="alternate" hreflang="x-default" href="{{ site.url }}{{ itUrl }}">
```

Note: Document templates (`documents-primo-en.liquid`, `documents-rinnovo-en.liquid`) use `layout: false` and have their own hardcoded hreflang — they will need separate FR hreflang added when FR document templates are created, and the EN ones should be updated to add the FR alternate.

### Anti-Patterns to Avoid

- **Using relative asset paths from `fr/index.html`:** Wrong: `../IMAGES/logo.png`. Right: `/IMAGES/logo.png`. FR pages output at `/fr/` not nested, but assets live at root.
- **Using `src/pages/` in links:** All cross-page links must use root-relative slug paths: `database.html` not `src/pages/database.html`.
- **Using `{% if var %}` for JS booleans:** Use `{% if var == true %}`. Liquid's truthy evaluation is unreliable with JS booleans passed from data files.
- **Not adding `eleventyExcludeFromCollections: true`:** Pagination templates must have this to avoid being treated as collection items.
- **Forgetting `lang: fr` in front matter:** The `lang` variable drives the nav component, footer, language switcher display, and HTML `lang` attribute.
- **Forgetting `pages.11tydata.js` in `fr/src/pages/`:** Without it, static pages output to wrong paths (nested under `fr/src/pages/` instead of `fr/`).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slug resolution | Custom FR slug system | Reuse `itSlugMap` from `permitsFr.js` and `documentsFr.js` | FR slugs ARE IT slugs — already solved |
| Language detection | Custom URL parser | HTML `lang` attribute (already in `base.liquid`) | Server renders correct lang, JS reads it |
| Document checklist state | Custom storage | localStorage with permit-specific key | Pattern already working in EN |
| Nav/footer per language | Hardcoded in templates | `_data/nav.js` and `_data/footer.js` lang lookup | Already extensible — just add `fr` key |
| Static file conflict resolution | Manual file deletion | `eleventy.config.mjs` dynamic ignore block | Pattern already used for EN documenti-* |

**Key insight:** Every problem in FR page generation already has a solved pattern in the EN pipeline. The entire implementation is translation and pattern replication, not new architecture.

## Common Pitfalls

### Pitfall 1: DuplicatePermalinkOutputError (CRITICAL BLOCKER)
**What goes wrong:** 11ty build fails with `DuplicatePermalinkOutputError` when both a static `.html` file and a pagination template try to output the same path.
**Why it happens:** 66 untracked EN static `permesso-*.html` files in `en/src/pages/` exist alongside `permits-en.liquid`. When passthrough copy processes the static files AND the Liquid template generates pages, they collide.
**How to avoid:** Add a safety net in `eleventy.config.mjs` to dynamically ignore `en/src/pages/permesso-*.html` files (same pattern as the existing `documenti-*` safety net). Do this before creating FR files.
**Warning signs:** Build output includes `DuplicatePermalinkOutputError` mentioning `en/permesso-*.html`.

### Pitfall 2: Missing `pages.11tydata.js` Causes Wrong Output Paths
**What goes wrong:** FR static pages output to `fr/src/pages/database.html` instead of `fr/database.html`.
**Why it happens:** Without `pages.11tydata.js`, 11ty uses the file path as-is for output.
**How to avoid:** Create `fr/src/pages/pages.11tydata.js` with permalink override returning `fr/${data.page.fileSlug}.html`. The `if (data.pagination) return data.permalink` guard is required to not break the pagination templates.
**Warning signs:** Pages appear nested under `_site/fr/src/pages/` instead of `_site/fr/`.

### Pitfall 3: Language Switcher Shows Alert for FR
**What goes wrong:** Clicking FR in the language switcher shows an alert "This language is coming soon!"
**Why it happens:** `app.js` line 227 has `if (selectedLang !== 'it' && selectedLang !== 'en') { alert(...); return; }`.
**How to avoid:** Remove or extend this guard to include `'fr'` before deploying FR pages. Also uncomment the FR path detection line in `detectLanguage()`.
**Warning signs:** Clicking FR option in dropdown shows alert instead of navigating.

### Pitfall 4: Header Logo Points to Wrong Homepage
**What goes wrong:** On FR pages, the logo links to `/en/` or `/`.
**Why it happens:** `header.liquid` only has `{% if lang == 'en' %}...{% else %}{{ '/' | url }}{% endif %}` — FR falls through to IT.
**How to avoid:** Update header.liquid with a three-way `{% if lang == 'fr' %}...{% elsif lang == 'en' %}...{% else %}...{% endif %}`.
**Warning signs:** Clicking the logo from a FR page redirects to the IT homepage.

### Pitfall 5: hreflang Missing FR Alternate
**What goes wrong:** Search engines treat FR pages as duplicates of IT pages.
**Why it happens:** `base.liquid` only emits IT and EN hreflang tags.
**How to avoid:** Update hreflang logic in `base.liquid` to detect `/fr/` prefix and emit FR alternate. Also update EN document templates (which use `layout: false` with their own hreflang).
**Warning signs:** Missing `<link rel="alternate" hreflang="fr">` in FR page source.

### Pitfall 6: `getSectionBorderColor` Filter Uses IT Keywords Only
**What goes wrong:** Section border colors may all fall through to the index-based fallback on FR permit pages because keyword matching uses Italian strings.
**Why it happens:** The filter in `eleventy.config.mjs` checks for strings like "cos'è", "requisiti", "lavorare" — not French equivalents.
**How to avoid:** Accept this as cosmetic limitation (fallback by index still provides variety) OR add French keywords to the filter. For v1 FR pages, the index fallback is acceptable.
**Warning signs:** All section cards use cycling colors instead of semantically appropriate colors.

### Pitfall 7: EN Document Templates Miss FR hreflang
**What goes wrong:** EN document pages (`en/documenti-*-primo.html`) only have IT and EN hreflang alternates, missing FR.
**Why it happens:** EN document templates (`documents-primo-en.liquid`, `documents-rinnovo-en.liquid`) use `layout: false` with hardcoded hreflang that pre-dates FR.
**How to avoid:** When creating FR document templates, also update the EN document templates to add `<link rel="alternate" hreflang="fr" href="...">`.
**Warning signs:** EN document pages lack FR hreflang in `<head>`.

## Code Examples

### Complete `fr/src/pages/pages.11tydata.js`
```javascript
// Source: mirrors en/src/pages/pages.11tydata.js
module.exports = {
  eleventyComputed: {
    permalink: (data) => {
      // Don't override permalink for pagination templates
      if (data.pagination) return data.permalink;
      return `fr/${data.page.fileSlug}.html`;
    }
  }
};
```

### FR Permit Template Front Matter
```yaml
---
pagination:
  data: permitsFr
  size: 1
  alias: permit
permalink: "fr/permesso-{{ permit.slug }}.html"
layout: layouts/base.liquid
title: "Permis pour {{ permit.tipo }}"
lang: fr
description: "Permis de séjour {{ permit.tipo }} - informations, conditions, documents et démarches"
eleventyExcludeFromCollections: true
---
```

### FR Document Primo Template Front Matter
```yaml
---
pagination:
  data: documentsFr.primo
  size: 1
  alias: doc
permalink: "fr/documenti-{{ doc.slug }}-primo.html"
layout: false
lang: fr
eleventyExcludeFromCollections: true
---
```

### FR Document Rinnovo Template Front Matter
```yaml
---
pagination:
  data: documentsFr.rinnovo
  size: 1
  alias: doc
permalink: "fr/documenti-{{ doc.slug }}-rinnovo.html"
layout: false
lang: fr
eleventyExcludeFromCollections: true
---
```

### `eleventy.config.mjs` Safety Net for EN Permits (BLOCKER FIX)
```javascript
// Safety net for EN static permit pages (causes DuplicatePermalinkOutputError)
// Add this INSIDE the existing enPagesDir try block, after the enDocFiles block
try {
  const enFiles = fs.readdirSync(enPagesDir);
  const enPermitFiles = enFiles.filter(f =>
    f.startsWith('permesso-') && f.endsWith('.html')
  );
  for (const file of enPermitFiles) {
    eleventyConfig.ignores.add(`en/src/pages/${file}`);
  }
  if (enPermitFiles.length > 0) {
    console.log(`[eleventy] Ignoring ${enPermitFiles.length} static EN permit files (replaced by Liquid templates)`);
  }
} catch (e) {}
```

### Language Switcher FR Navigation Logic
```javascript
// Source: extension of existing app.js language switching logic
const isCurrentlyFrench = currentPath.startsWith('/fr/') || currentPath === '/fr';
const isCurrentlyEnglish = currentPath.startsWith('/en/') || currentPath === '/en';

if (selectedLang === 'fr') {
  if (isCurrentlyFrench) return;
  if (currentPath === '/' || currentPath === '/index.html') {
    newPath = '/fr/';
  } else if (isCurrentlyEnglish) {
    newPath = '/fr' + currentPath.replace(/^\/en/, '');
  } else {
    newPath = '/fr' + currentPath;
  }
}
```

## Complete List of Files to Create/Modify

### Create (new files)
1. `fr/index.html` — FR homepage (static, copy EN pattern, translate)
2. `fr/src/pages/pages.11tydata.js` — permalink override for FR
3. `fr/src/pages/permits-fr.liquid` — pagination template
4. `fr/src/pages/documents-primo-fr.liquid` — pagination template
5. `fr/src/pages/documents-rinnovo-fr.liquid` — pagination template
6. `fr/src/pages/database.html` — permit listing (FR translated)
7. `fr/src/pages/documenti-questura.html` — document listing (FR translated)
8. `fr/src/pages/chi-siamo.html` — about page (FR translated)

### Modify (existing files)
1. `eleventy.config.mjs` — add EN permit safety net + FR document safety net
2. `_data/nav.js` — add `fr` entry
3. `_data/footer.js` — add `fr` entry
4. `_includes/components/header.liquid` — add FR logo link condition
5. `_includes/components/language-switcher.liquid` — show FR as current language
6. `src/scripts/app.js` — enable FR path detection + navigation
7. `_includes/layouts/base.liquid` — add FR hreflang alternate
8. `en/src/pages/documents-primo-en.liquid` — add FR hreflang (optional but good)
9. `en/src/pages/documents-rinnovo-en.liquid` — add FR hreflang (optional but good)

### Minimum viable set (required for success criteria)
Files 1-8 in Create list + files 1-7 in Modify list = 15 operations.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static HTML per permit | 11ty pagination from Notion data | Phase 40 | FR inherits this — no static permits needed |
| Manual language switching | nav.js lang key lookup | Phase 49 (EN) | Just add `fr` key |
| IT-only hreflang | IT + EN hreflang | Phase 49 (EN) | Extend to IT + EN + FR |

**Not deprecated:** The `pages.11tydata.json` file in `en/src/pages/` exists alongside `pages.11tydata.js`. The `.js` version takes precedence. For FR, create only `pages.11tydata.js` (skip the `.json`).

## Open Questions

1. **Which additional static pages to create for FR beyond the 3 required?**
   - What we know: EN has 9 additional static pages (aiuto-legale, controlla-permesso, decreto-flussi, dizionario, il-progetto, kit-postale, privacy-policy, protezione-internazionale, ricongiungimento-familiare)
   - What's unclear: Success criteria requires only homepage + database + documenti-questura + chi-siamo. Should the other 9 be created?
   - Recommendation: Create the 3 required by success criteria plus `chi-siamo.html` (FGEN-03 mentions it). Defer the remaining 9 to avoid scope creep. If nav.js links point to them, they should either be created or the FR nav should omit them.

2. **How to handle FR nav links to pages that won't exist yet?**
   - What we know: EN nav links to `/en/dizionario.html`, `/en/protezione-internazionale.html`, `/en/permesso-ricongiungimento-familiare.html` — these ARE generated by Notion pagination for EN.
   - What's unclear: Will the same FR pages be generated? `permesso-ricongiungimento-familiare.html` will be generated from Notion FR data. `dizionario.html` and `protezione-internazionale.html` are static.
   - Recommendation: Nav links to `permesso-ricongiungimento-familiare.html` are safe (generated). For `dizionario` and `protezione-internazionale`, either create minimal FR stubs or point FR nav to IT versions temporarily.

3. **Should the EN documents templates be updated with FR hreflang in this phase?**
   - What we know: EN document templates have hardcoded IT+EN hreflang. They'll be incomplete once FR exists.
   - Recommendation: Update them in this phase since we're already touching infrastructure. It's a 1-line addition per template.

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection of all referenced files:
  - `en/src/pages/permits-en.liquid` — EN permit template (verified)
  - `en/src/pages/documents-primo-en.liquid` — EN document primo template (verified)
  - `en/src/pages/documents-rinnovo-en.liquid` — EN document rinnovo template (verified)
  - `en/src/pages/pages.11tydata.js` — EN permalink override (verified)
  - `en/src/pages/database.html` — EN static listing (verified)
  - `eleventy.config.mjs` — 11ty configuration with existing safety nets (verified)
  - `_data/nav.js` — navigation data (verified)
  - `_data/footer.js` — footer data (verified)
  - `_includes/components/header.liquid` — header component (verified)
  - `_includes/components/language-switcher.liquid` — switcher component (verified)
  - `_includes/layouts/base.liquid` — base layout with hreflang (verified)
  - `src/scripts/app.js` — language switching JS (verified)
  - `_data/permitsFr.js` — FR permit data file from Phase 52 (verified)
  - `_data/documentsFr.js` — FR document data file from Phase 52 (verified)
- `ls en/src/pages/` — confirmed 66 stale EN permit static files present

### Secondary (MEDIUM confidence)
- STATE.md decision records and phase context provided by orchestrator

### Tertiary (LOW confidence)
- French UI string translations — generated from training data, not verified against a translation style guide

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tooling verified by direct file inspection
- Architecture: HIGH — EN pipeline fully inspected, FR replication is mechanical
- Pitfalls: HIGH — blocker confirmed by file count (66 permesso-*.html files present), other pitfalls derived from direct code reading
- French UI strings: LOW — translations are reasonable but not reviewed by a native French speaker

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (stable stack, 30-day window)
