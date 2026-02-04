# Phase 36: Components - Research

**Researched:** 2026-02-04
**Domain:** 11ty v3.x Layouts, Includes, and Reusable Components
**Confidence:** HIGH

## Summary

This phase extracts shared HTML components (header, footer, navigation, language switcher) from the existing 469 HTML files into reusable 11ty includes and a base layout. The current site has these components duplicated across every page with only minor differences: path depth (relative paths like `../`, `../../`, `../../../`) and language (IT vs EN content).

The standard approach uses 11ty's `_includes` directory for component partials and layouts. A single base layout contains the HTML document structure (doctype, head, body) and includes the shared components. Each page then uses front matter to specify `layout: base.liquid` and provides only its unique content. Path handling is solved using 11ty's `url` filter which generates correct paths relative to the site root.

**Primary recommendation:** Create a `_includes/` directory with `layouts/base.liquid` as the base layout, and separate include files for `header.liquid`, `footer.liquid`, `nav.liquid`, and `language-switcher.liquid`. Use data files for language-specific navigation labels.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @11ty/eleventy | 3.1.2 | Static site generator | Already installed in Phase 35 |
| liquidjs | 10.x | Template engine | Bundled with 11ty, actively maintained, default engine |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none additional) | - | - | All Phase 36 needs are met by 11ty core features |

**Note:** No additional dependencies needed. 11ty v3.x includes everything required for layouts, includes, and data files.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Liquid includes | Nunjucks {% extends %} | Nunjucks unmaintained since June 2022 - don't use |
| Data files for i18n | Full i18n plugin | i18n plugin adds complexity; data files sufficient for IT/EN |
| Multiple base layouts | Single layout + conditionals | Single layout simpler for this project's needs |

## Architecture Patterns

### Recommended Project Structure

```
Sito_Nuovo/
├── _includes/
│   ├── layouts/
│   │   └── base.liquid          # Base HTML structure
│   ├── components/
│   │   ├── header.liquid        # Site header with logo
│   │   ├── footer.liquid        # Site footer
│   │   ├── nav.liquid           # Navigation menu (desktop + mobile)
│   │   └── language-switcher.liquid  # Language dropdown
│   └── partials/
│       └── head-meta.liquid     # Common <head> elements (optional)
├── _data/
│   ├── eleventyComputed.js      # Existing: URL preservation
│   ├── site.js                  # NEW: Site-wide config (title, year)
│   └── nav.js                   # NEW: Navigation items by language
├── eleventy.config.mjs          # Existing: add includes config
├── index.html                   # Uses: layout: base.liquid
├── src/pages/*.html             # Use: layout: base.liquid
└── en/
    ├── index.html               # Uses: layout: base.liquid
    └── src/pages/*.html         # Use: layout: base.liquid
```

### Pattern 1: Base Layout with Content Insertion

**What:** Single layout file wrapping all pages with `{{ content }}` insertion point
**When to use:** All pages in the site
**Example:**

```liquid
<!-- _includes/layouts/base.liquid -->
<!DOCTYPE html>
<html lang="{{ lang | default: 'it' }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{ description | default: site.defaultDescription }}">
  <title>{{ title }} - {{ site.name }}</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="{{ '/IMAGES/logo-full.png' | url }}">

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="{{ '/src/styles/main.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/components.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/animations.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/mobile.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/mobile-fix.css' | url }}">
</head>
<body>
  {% include "components/header.liquid" %}

  {{ content }}

  {% include "components/footer.liquid" %}

  <!-- Scripts -->
  <script src="{{ '/src/scripts/app.js' | url }}"></script>
  <script src="{{ '/src/scripts/mobile.js' | url }}"></script>
</body>
</html>
```

### Pattern 2: Include with Language-Aware Data

**What:** Includes that read from data files based on current language
**When to use:** Navigation, footer links, any translated strings
**Example:**

```liquid
<!-- _includes/components/nav.liquid -->
<div class="nav-wrapper">
  <ul class="nav-menu" id="nav-menu">
    {% for item in nav[lang] %}
    <li class="nav-item{% if item.children %} has-dropdown{% endif %}">
      <a href="{{ item.url | url }}" class="nav-link"
         {% if item.external %}target="_blank"{% endif %}
         {% if item.children %}aria-haspopup="true" aria-expanded="false"{% endif %}>
        {{ item.label }}
      </a>
      {% if item.children %}
      <ul class="nav-dropdown" role="menu">
        {% for child in item.children %}
        <li role="none">
          <a href="{{ child.url | url }}" class="dropdown-link" role="menuitem"
             {% if child.external %}target="_blank"{% endif %}>
            {{ child.label }}
          </a>
        </li>
        {% endfor %}
      </ul>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</div>
```

### Pattern 3: Data File for Translations

**What:** JavaScript data file with language-keyed objects
**When to use:** Any content that differs between IT and EN
**Example:**

```javascript
// _data/nav.js
module.exports = {
  it: [
    {
      label: "Database",
      url: "/src/pages/database.html",
      children: [
        { label: "Tutti i permessi", url: "/src/pages/database.html" },
        { label: "Che documenti porto in Questura", url: "/src/pages/documenti-questura.html" }
      ]
    },
    {
      label: "Guide",
      url: "/src/pages/dizionario.html",
      children: [
        { label: "Protezione internazionale", url: "/src/pages/protezione-internazionale.html" },
        { label: "Ricongiungimento familiare", url: "/src/pages/permesso-ricongiungimento-familiare.html" },
        { label: "Dizionario", url: "/src/pages/dizionario.html" }
      ]
    }
    // ... more items
  ],
  en: [
    {
      label: "Database",
      url: "/en/src/pages/database.html",
      children: [
        { label: "All permits", url: "/en/src/pages/database.html" },
        { label: "Documents to bring to Police", url: "/en/src/pages/documenti-questura.html" }
      ]
    }
    // ... more items
  ]
};
```

### Pattern 4: Page Front Matter

**What:** Each page specifies layout and provides its data
**When to use:** Every HTML page in the site
**Example:**

```html
---
layout: layouts/base.liquid
title: Chi Siamo
lang: it
---
<!-- Only the unique page content goes here -->
<div class="breadcrumb-bar">
  <div class="container">
    <div class="breadcrumb-content">
      <div class="breadcrumb-nav">
        <a href="{{ '/' | url }}">Home</a> →
        <span>Chi Siamo</span>
      </div>
    </div>
  </div>
</div>

<section class="section bg-off-white">
  <!-- page content -->
</section>
```

### Pattern 5: Language Detection via Directory Data

**What:** Directory data files set `lang` automatically for all pages in that directory
**When to use:** Setting language for entire directories
**Example:**

```json
// en/en.11tydata.json
{
  "lang": "en"
}

// src/pages/pages.11tydata.json (or root-level)
{
  "lang": "it",
  "permalink": "{{ page.filePathStem }}.html"
}
```

### Anti-Patterns to Avoid

- **Duplicating layouts for IT/EN:** Use one layout with `lang` variable, not separate `base-it.liquid` and `base-en.liquid`
- **Hardcoding relative paths:** Use `{{ '/path' | url }}` filter instead of `../`, `../../` chains
- **Processing includes as pages:** Files in `_includes/` are not processed as templates, but files in `src/components/` would be - keep includes in `_includes/`
- **Mixing layout systems:** Don't use both 11ty front matter `layout:` and Liquid `{% layout %}` tag in the same template
- **Forgetting `| safe` for content:** Liquid auto-escapes, but `{{ content }}` in layouts should render HTML directly (11ty handles this by default for `content`)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Path generation | Manual `../` counting | `{{ '/path' | url }}` filter | 11ty handles relative/absolute paths automatically |
| Language switching | Custom JS logic | Data files + `lang` variable | Simpler, works at build time |
| Include resolution | Custom file loading | `{% include "file.liquid" %}` | 11ty's standard include mechanism |
| Layout inheritance | Custom wrapper scripts | `layout: layouts/base.liquid` | 11ty's built-in layout system |
| Translation strings | Inline conditionals | Data files (`nav.js`, `footer.js`) | Centralized, maintainable |

**Key insight:** 11ty's include and layout system, combined with data files, handles all component extraction needs. No custom code required.

## Common Pitfalls

### Pitfall 1: Incorrect Include Directory

**What goes wrong:** Includes are not found, or are processed as full templates creating unwanted output files
**Why it happens:** Files placed in wrong directory, or `_includes` not configured properly
**How to avoid:** Create `_includes/` at project root (same level as `eleventy.config.mjs`). Verify with `eleventyConfig.setIncludesDirectory("_includes")` if needed.
**Warning signs:** Build errors saying "include file not found" or unexpected HTML files appearing in `_site/`

### Pitfall 2: Relative Paths Break After Migration

**What goes wrong:** Images, CSS, JS links broken on some pages but not others
**Why it happens:** Using hardcoded relative paths (`../styles/`) instead of root-relative with `url` filter
**How to avoid:** Convert ALL asset paths to `{{ '/path/to/asset' | url }}` format in includes and layouts
**Warning signs:** Console 404 errors for assets, pages look unstyled in deep directories

### Pitfall 3: Content Double-Escaped

**What goes wrong:** HTML appears as escaped text (`&lt;div&gt;` instead of `<div>`)
**Why it happens:** Using filters that escape HTML on content that should be raw
**How to avoid:** In Liquid, `{{ content }}` already outputs safely. Don't add `| escape` filter.
**Warning signs:** HTML tags visible as text on rendered pages

### Pitfall 4: Language Variable Not Set

**What goes wrong:** Wrong language content appears (e.g., Italian nav on English pages)
**Why it happens:** Directory data files missing or `lang` not propagating to includes
**How to avoid:** Create `en/en.11tydata.json` with `{"lang": "en"}` and ensure `lang` defaults to `"it"` in templates
**Warning signs:** Italian text on English pages, or Liquid errors about undefined `lang`

### Pitfall 5: Include Files Processed as Pages

**What goes wrong:** `header.html` appears in `_site/` as a standalone page
**Why it happens:** Include files placed in `src/` instead of `_includes/`, or using `.html` extension triggers processing
**How to avoid:** Keep includes in `_includes/` directory and use `.liquid` extension
**Warning signs:** Unexpected files in `_site/` output, partial HTML appearing as pages

### Pitfall 6: Missing Layout Causes Blank Pages

**What goes wrong:** Pages render as blank or with no HTML structure
**Why it happens:** Front matter `layout:` points to non-existent file, or path is wrong
**How to avoid:** Use `layout: layouts/base.liquid` (relative to `_includes/`), verify file exists before migrating pages
**Warning signs:** Blank pages, pages with only content and no head/body structure

## Code Examples

### Complete Base Layout

```liquid
<!-- _includes/layouts/base.liquid -->
<!DOCTYPE html>
<html lang="{{ lang | default: 'it' }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  {% if description %}
  <meta name="description" content="{{ description }}">
  {% endif %}
  <title>{% if title %}{{ title }} - {% endif %}{{ site.name }}</title>

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="{{ '/IMAGES/logo-full.png' | url }}">
  <link rel="shortcut icon" type="image/png" href="{{ '/IMAGES/logo-full.png' | url }}">
  <link rel="apple-touch-icon" href="{{ '/IMAGES/logo-full.png' | url }}">

  {% if og_title or title %}
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{ site.url }}{{ page.url }}">
  <meta property="og:title" content="{{ og_title | default: title }} - {{ site.name }}">
  <meta property="og:description" content="{{ og_description | default: description | default: site.defaultDescription }}">
  <meta property="og:image" content="{{ site.url }}/IMAGES/logo-full.png">
  {% endif %}

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="{{ '/src/styles/main.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/components.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/animations.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/mobile.css' | url }}">
  <link rel="stylesheet" href="{{ '/src/styles/mobile-fix.css' | url }}">

  {% if extraStyles %}{{ extraStyles }}{% endif %}
</head>
<body>
  {% include "components/header.liquid" %}

  {{ content }}

  {% include "components/footer.liquid" %}

  <!-- Scripts -->
  <script src="{{ '/src/scripts/app.js' | url }}"></script>
  <script src="{{ '/src/scripts/mobile.js' | url }}"></script>

  {% if extraScripts %}{{ extraScripts }}{% endif %}
</body>
</html>
```

### Header Include

```liquid
<!-- _includes/components/header.liquid -->
<header class="header">
  <div class="container">
    <nav class="navbar">
      <!-- Logo -->
      <a href="{% if lang == 'en' %}{{ '/en/' | url }}{% else %}{{ '/' | url }}{% endif %}" class="logo">
        <img src="{{ '/IMAGES/logo-full.png' | url }}" alt="SOS Permesso" class="logo-image">
      </a>

      {% include "components/language-switcher.liquid" %}

      <!-- Mobile Menu Toggle -->
      <button class="menu-toggle" id="menu-toggle" aria-label="Menu">
        &#9776;
      </button>

      {% include "components/nav.liquid" %}
    </nav>
  </div>
</header>
```

### Footer Include

```liquid
<!-- _includes/components/footer.liquid -->
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      {% assign footerData = footer[lang] | default: footer.it %}
      {% for link in footerData.links %}
        <a href="{{ link.url | url }}" class="footer-project-link">{{ link.label }}</a>
        {% unless forloop.last %}<span class="footer-separator">|</span>{% endunless %}
      {% endfor %}
      <span class="footer-separator">|</span>
      <p class="footer-copyright">&copy; {{ site.year }} {{ site.name }}</p>
    </div>
  </div>
</footer>
```

### Language Switcher Include

```liquid
<!-- _includes/components/language-switcher.liquid -->
<div class="language-switcher">
  <button class="language-button" id="language-toggle">
    <span id="current-language">{% if lang == 'en' %}EN &#127468;&#127463;{% else %}IT &#127470;&#127481;{% endif %}</span>
    <span>&#9662;</span>
  </button>
  <div class="language-dropdown" id="language-dropdown">
    <div class="language-option" data-lang="it">
      <span>&#127470;&#127481;</span>
      <span>Italiano</span>
    </div>
    <div class="language-option" data-lang="en">
      <span>&#127468;&#127463;</span>
      <span>English</span>
    </div>
    <div class="language-option" data-lang="fr">
      <span>&#127467;&#127479;</span>
      <span>Fran&ccedil;ais</span>
    </div>
    <div class="language-option" data-lang="es">
      <span>&#127466;&#127480;</span>
      <span>Espa&ntilde;ol</span>
    </div>
    <div class="language-option" data-lang="zh">
      <span>&#127464;&#127475;</span>
      <span>&#20013;&#25991;</span>
    </div>
  </div>
</div>
```

### Site Data File

```javascript
// _data/site.js
module.exports = {
  name: "SOS Permesso",
  url: "https://www.sospermesso.it",
  year: new Date().getFullYear(),
  defaultDescription: "Guida completa ai permessi di soggiorno in Italia"
};
```

### Footer Data File

```javascript
// _data/footer.js
module.exports = {
  it: {
    links: [
      { label: "Il Progetto", url: "/src/pages/il-progetto.html" },
      { label: "Chi Siamo", url: "/src/pages/chi-siamo.html" },
      { label: "Privacy e altro", url: "/src/pages/privacy-policy.html" }
    ]
  },
  en: {
    links: [
      { label: "The Project", url: "/en/src/pages/il-progetto.html" },
      { label: "About Us", url: "/en/src/pages/chi-siamo.html" },
      { label: "Privacy and more", url: "/en/src/pages/privacy-policy.html" }
    ]
  }
};
```

### Eleventy Config Updates

```javascript
// eleventy.config.mjs - additions for Phase 36
export default function(eleventyConfig) {
  // ... existing ignores and passthrough copy ...

  // Explicitly set includes directory (optional - _includes is default)
  // eleventyConfig.setIncludesDirectory("_includes");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"  // Optional: explicit setting
    },
    templateFormats: ["html", "liquid", "md"],
    htmlTemplateEngine: "liquid"
  };
}
```

### Migrated Page Example

```html
---
layout: layouts/base.liquid
title: Chi Siamo
lang: it
---
<!-- BREADCRUMB -->
<div class="breadcrumb-bar">
  <div class="container">
    <div class="breadcrumb-content">
      <div class="breadcrumb-nav">
        <a href="{{ '/' | url }}">Home</a> &rarr;
        <span>Chi Siamo</span>
      </div>
    </div>
  </div>
</div>

<!-- PAGE HEADER -->
<section class="section bg-off-white">
  <div class="container">
    <div class="page-header text-center">
      <span class="page-icon" style="font-size: 4rem;">&#128101;</span>
      <h1 class="page-title">Chi siamo</h1>
    </div>
  </div>
</section>

<!-- CONTENT -->
<section class="section">
  <div class="container" style="max-width: 900px;">
    <!-- ... page-specific content ... -->
  </div>
</section>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Nunjucks templates | Liquid templates | 11ty v1.0+ (2022) | Liquid is default, actively maintained |
| CommonJS data files | ESM data files | 11ty v3.0 (2024) | Both work, ESM preferred |
| Manual relative paths | `url` filter | Always | Filter handles path resolution |
| Separate language templates | Data files + `lang` variable | Best practice | Single template, multiple languages |

**Deprecated/outdated:**
- **Nunjucks**: Technically works but unmaintained since June 2022 - use Liquid
- **Jekyll-style includes without quotes**: Requires `dynamicPartials: false` in 11ty - use quoted includes

## Open Questions

1. **Homepage special handling**
   - What we know: Root `index.html` and `en/index.html` have unique hero sections
   - What's unclear: Should homepages use same layout or specialized homepage layout?
   - Recommendation: Use same base layout; hero is just unique content within `{{ content }}`

2. **Contact form component**
   - What we know: Some pages load `contact-form.html` via JavaScript fetch
   - What's unclear: Should this become a Liquid include or stay as client-side load?
   - Recommendation: Keep as client-side load for now (modal behavior requires JS anyway)

3. **Inline styles in pages**
   - What we know: Some pages have inline `<style>` blocks (lighthouse animations)
   - What's unclear: How to handle page-specific styles in layout
   - Recommendation: Use `extraStyles` variable in front matter or keep inline in content

## Sources

### Primary (HIGH confidence)
- [Eleventy Layouts Documentation](https://www.11ty.dev/docs/layouts/) - Layout system, front matter, content variable
- [Eleventy Liquid Documentation](https://www.11ty.dev/docs/languages/liquid/) - Include syntax, data passing
- [Eleventy Configuration](https://www.11ty.dev/docs/config/) - Includes directory settings
- [Eleventy Layout Chaining](https://www.11ty.dev/docs/layout-chaining/) - Nested layouts
- [Eleventy Data Cascade](https://www.11ty.dev/docs/data-cascade/) - Data merge priority

### Secondary (MEDIUM confidence)
- [Multilingual Sites with Eleventy](https://www.webstoemp.com/blog/multilingual-sites-eleventy/) - i18n patterns
- [Using Liquid Blocks in Eleventy](https://www.raymondcamden.com/2021/08/19/using-liquid-blocks-in-eleventy-layouts) - Advanced layout patterns
- [Eleventy i18n Documentation](https://www.11ty.dev/docs/i18n/) - Official i18n approach

### Tertiary (LOW confidence)
- N/A - All findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All features are core 11ty functionality
- Architecture: HIGH - Patterns from official documentation
- Pitfalls: HIGH - Common issues documented in 11ty community

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable technology)
