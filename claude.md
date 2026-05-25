# SOS Permesso - Project Documentation

## CRITICAL RULES

**NEVER push to the remote repository unless the user explicitly says "push" or "push it".** Committing locally is fine when asked, but `git push` requires explicit authorization every single time. No exceptions.

## Project Overview

**SOS Permesso** is a comprehensive, multilingual website providing information about residence permits (permessi di soggiorno) in Italy. The website aims to make complex bureaucratic information accessible, easy to understand, and available in multiple languages.

## Task Management & Planning

### Default: Check Local Docs First

**ALWAYS start by reading local project docs:**

1. **Read `.planning/PROJECT.md`** — shipped features, technical debt, architecture, constraints
2. **Read `.planning/BACKLOG.md`** — milestone overview
3. **Read `.planning/TODO-permits.md`** — auto-generated list of permits needing content

These files contain everything needed for most tasks.

### Notion: Only When Explicitly Asked

**Only check Notion when the user explicitly requests it** (e.g., "check Notion", "sync with Notion", "what's in CHI FA COSA").

Notion task board URL: https://www.notion.so/2cd7355e7f7f80538130e9c246190699
Notion permit database (LIVE): https://www.notion.so/sospermesso/DATABASE-DI-PERMESSI-DI-SOGGIORNO-3097355e7f7f806b8018fe85ce2c9f35

When checking Notion:
- Use `mcp__claude_ai_Notion__notion-search` to find tasks
- Task properties: Status (To Do/In Progress/Done), Priorita (Alta/Media/Bassa), Chi lo fa

### What Goes Where

| Location | Content |
|----------|---------|
| `.planning/PROJECT.md` | Shipped features, technical debt, architecture, constraints |
| `.planning/BACKLOG.md` | Milestone overview |
| `.planning/TODO-permits.md` | Permits needing Notion content (auto-generated) |
| **Notion "CHI FA COSA"** | Detailed task tracking (only when user asks) |
| **Notion "Database permessi"** | Permit page content (Q&A sections) |
| **Notion "Documenti Questura"** | Document requirement content |

## Design Philosophy

- **Bright & Colorful**: Vibrant color palette with gradients to create a friendly, welcoming atmosphere
- **Mobile-First**: Optimized for mobile devices with responsive design throughout
- **Accessible**: Clear typography, simple language, and intuitive navigation
- **Cartoon-Style**: Friendly graphics including an adorable lighthouse mascot and paperwork illustrations
- **Multilingual**: Architecture supports multiple languages (IT, EN, FR, ES, ZH)

## Color Palette

### Primary Colors
- **Taxi Yellow**: #FFD700 (main brand color)
  - Light: #FFF176
  - Dark: #FFC107
  - Bright: #FFEB3B
- **Lighthouse Red**: #FF5252 (accent color)
  - Dark: #E02B2B
  - Bright: #FF6B6B

### Accent Colors (Bright & Vibrant)
- **Blue**: #42A5F5 / #64B5F6
- **Teal**: #26A69A / #4DB6AC
- **Orange**: #FF9800 / #FFB74D
- **Purple**: #AB47BC / #BA68C8
- **Pink**: #EC407A / #F06292
- **Green**: #66BB6A / #81C784

### Neutrals
- Black: #1A1A1A
- Gray Dark: #2D2D2D
- Gray Medium: #757575
- Gray Light: #F5F5F5
- White: #FFFFFF
- Off-white: #FAFAFA

## Project Structure

```
Sito_Nuovo/
├── eleventy.config.mjs          # 11ty configuration (filters, passthrough, etc.)
├── index.html                   # MAIN HOME PAGE (in root, NOT in src/pages/)
├── CLAUDE.md                    # This documentation file
├── _includes/
│   └── layouts/
│       └── base.liquid          # Base layout (head, header, footer, nav)
│   ├── header.liquid            # Header component include
│   ├── footer.liquid            # Footer component include
│   ├── nav.liquid               # Navigation include (desktop + mobile)
│   └── language-switcher.liquid # IT/EN toggle include
├── _data/                       # 11ty data files
│   ├── site.js                  # Site metadata (title, URL, etc.)
│   ├── nav.js                   # Navigation structure
│   ├── footer.js                # Footer data
│   ├── permits.js               # Notion → IT permit page data (DB ID hardcoded)
│   ├── permitsEn.js             # Notion → EN permit page data (DB ID hardcoded)
│   ├── documents.js             # Notion → IT document page data (DB ID hardcoded)
│   └── documentsEn.js           # Notion → EN document page data (DB ID hardcoded)
├── _site/                       # BUILD OUTPUT (generated, gitignored)
│   ├── *.html                   # ALL pages output at ROOT level (flat)
│   └── en/*.html                # EN pages at en/ prefix (same slugs as IT)
├── src/
│   ├── pages/                   # Source pages (11ty processes these)
│   │   ├── database.html        # Database landing page
│   │   ├── chi-siamo.html       # About us page
│   │   ├── documenti-questura.html
│   │   ├── permits.liquid       # 11ty pagination template → permesso-{slug}.html
│   │   ├── documents-primo.liquid    # 11ty pagination template → documenti-{slug}-primo.html
│   │   └── documents-rinnovo.liquid  # 11ty pagination template → documenti-{slug}-rinnovo.html
│   ├── styles/                  # CSS files
│   │   ├── main.css             # Base styles & color system (CSS variables)
│   │   ├── components.css       # Component-specific styles
│   │   ├── animations.css       # Animation definitions
│   │   ├── mobile.css           # Mobile responsive styles
│   │   └── mobile-fix.css       # Critical mobile fixes
│   ├── scripts/                 # Client-side JavaScript
│   │   ├── app.js               # Main application logic
│   │   └── mobile.js            # Mobile-specific functionality
│   └── data/                    # Content data (homepage)
│       ├── content-it.json      # Italian content
│       └── content-en.json      # English content
├── en/                          # English pages (generated from Notion via 11ty)
│   ├── index.html               # EN homepage (static)
│   └── src/pages/               # EN static pages + pagination templates
│       ├── database.html        # EN database landing (static)
│       ├── documenti-questura.html # EN documents landing (static)
│       ├── permits-en.liquid    # EN pagination template for permits
│       ├── documents-primo-en.liquid  # EN pagination template for primo docs
│       └── documents-rinnovo-en.liquid # EN pagination template for rinnovo docs
├── scripts/                     # Build scripts (Node.js)
│   ├── build-documents.js       # Notion → document HTML (legacy, being replaced by 11ty)
│   ├── build-permits.js         # Notion → permit HTML
│   ├── build-sitemap.js         # Sitemap generation
│   ├── notion-client.js         # Notion API client
│   ├── translation-memory.js    # Translation caching module
│   └── templates/               # HTML generation templates
│       ├── primo.js             # First release template (legacy)
│       ├── rinnovo.js           # Renewal template (legacy)
│       ├── permesso.js          # Permit page template
│       └── helpers.js           # Shared template filters (used by 11ty too)
└── .planning/                   # Project planning docs
    ├── PROJECT.md               # Current state, milestones, architecture
    ├── BACKLOG.md               # Milestone overview
    └── TODO-permits.md          # Permits needing content (auto-generated)

Pages use front matter (---layout/title/lang---) and shared layouts via 11ty.
Build: `npm run build` chains Notion content fetch + 11ty static generation.
Output goes to _site/ (ALL pages at root level, EN at en/ prefix) and deploys to Netlify.

**IMPORTANT — URL Architecture:**
- ALL pages output at ROOT level in `_site/`. No `src/pages/` nesting in URLs.
- Permits: `permesso-{slug}.html`, Documents: `documenti-{slug}-primo.html` / `documenti-{slug}-rinnovo.html`
- EN pages: `en/permesso-{slug}.html`, `en/documenti-{slug}-primo.html`, etc. (same IT slugs)
- Cross-page links: simple relative paths (e.g., `database.html`, NOT `src/pages/database.html`)
- Notion database IDs are HARDCODED in data files, not read from env vars (only NOTION_API_KEY needed)
- Architecture is FLAT: 1 Notion page = 1 HTML page. No variants, no redirects.
```

## Key Features

### 1. Lighthouse Hero Animation
- Red-white striped lighthouse with adorable cartoon face
- Animated features:
  - Rotating light beam (4s loop)
  - Blinking eyes (4s loop)
  - Animated ocean waves
  - Pulsing star on top
  - Sway animation on hover
- Fully responsive (scales from 400px to 180px on landscape mobile)

### 2. Colorful Gradient Cards
- Each card has:
  - Subtle gradient background
  - Rainbow gradient top border (visible on hover)
  - Golden glow shadow on hover
  - Scale and lift animation
- Category sections have unique gradient backgrounds

### 3. Vibrant Gradient Buttons
- Primary buttons: Yellow gradient with golden glow
- Secondary buttons: Red gradient with red glow
- Smooth hover transitions with scale and shadow effects

### 4. Contact Form Modal
- Accessible modal with backdrop blur
- Form fields:
  - Name (required)
  - Email (required)
  - Subject dropdown (7 options)
  - Message textarea (20 char minimum)
  - Privacy checkbox (required)
- Loading states and success/error feedback
- Mobile-optimized (16px font to prevent iOS zoom)

### 5. Cartoon Illustrations (Available but not currently displayed)
Four SVG illustrations of people dealing with paperwork:
- **Confused**: Person overwhelmed with papers, sweat drops, question marks
- **Success**: Person celebrating with checklist, confetti, stars
- **Searching**: Person examining documents with magnifying glass
- **Stack**: Person carrying huge stack of papers, determined expression

Each has smooth CSS animations (floating, waving, bobbing).

## Database Pages Architecture

### Template Structure
All permit detail pages follow a consistent structure:

1. **Header** with breadcrumb navigation
2. **Page Header** with emoji icon, title, and subtitle
3. **Content Sections**:
   - 📝 Cos'è (What it is)
   - ⏱️ Durata (Duration)
   - ✅ Requisiti (Requirements)
   - 📄 Documenti necessari (Required documents)
   - 💼 Si può lavorare? (Can you work?)
   - 🔄 Conversione (Conversion, if applicable)
   - 💰 Costi (Costs)
   - 💡 Aspetti pratici (Practical aspects, if applicable)
4. **Alert boxes** for warnings and tips
5. **Related links** section
6. **Footer** with contact form integration

### Permit Pages

**Permit pages are generated dynamically from Notion** via 11ty pagination templates.
- Flat architecture: 1 Notion DB entry = 1 HTML page (no variants, no parent/child)
- IT permits: `_data/permits.js` → `src/pages/permits.liquid` → `permesso-{slug}.html`
- EN permits: `_data/permitsEn.js` → `en/src/pages/permits-en.liquid` → `en/permesso-{slug}.html`
- EN pages use same IT slugs (resolved via IT Page ID mapping)

**Standard Q&A template** (7 sections + extras):
1. Cos'è questo permesso?
2. Chi può chiederlo?
3. Come/dove si chiede?
4. Che diritti mi dà?
5. Quanto dura?
6. Quando scade posso rinnovarlo?
7. Posso convertirlo in un altro permesso?
+ Additional permit-specific Q&A from Notion

### Database Categories (database.html)
- **📋 STUDIO/LAVORO** (Warm gradient)
  - Study, Employed work, Self-employment, EU long-term, Job seeking
- **🛡️ PROTEZIONE** (Orange-Pink gradient)
  - Asylum request, Refugee status, Subsidiary protection, Special protection, Minors, Natural disaster, Administrative continuation
- **🏥 CURE MEDICHE** (Blue-Green gradient)
  - Pregnancy, Medical treatment, Serious health reasons
- **👨‍👩‍👧‍👦 MOTIVI FAMILIARI** (Teal-Yellow gradient)
  - Family reunification, Family cohesion, Parent of Italian minor, Relatives of Italians, Minor assistance, EU family member, "Famit" permit, Family residence card, Refugee family members

## Multilingual System

### Architecture
- 11ty-based: each language has its own data files + pagination templates
- IT pages at root (`/`), EN pages at `/en/`, future languages at `/{lang}/`
- Language switcher include in base layout (IT ↔ EN toggle)
- hreflang tags in base layout for SEO (canonical + alternate)
- Sitemap index architecture: `sitemap-index.xml` → `sitemap-it.xml` + `sitemap-en.xml`
- Translation memory infrastructure for incremental re-translation
- **Currently implemented:** IT 🇮🇹, EN 🇬🇧
- **Future:** FR 🇫🇷, ES 🇪🇸, ZH 🇨🇳 (infrastructure exists, content pending)

### Adding a New Language (Checklist)
1. Create Notion translated database via `scripts/translate-notion.js --lang {code}`
   - All translated DBs live under **"Traduzioni del Database"** parent page: `30b7355e-7f7f-8184-975d-fb18ca69875c` ([Notion link](https://www.notion.so/sospermesso/Traduzioni-del-Database-30b7355e7f7f8184975dfb18ca69875c))
   - Add `NOTION_{LANG}_PARENT_PAGE_ID=30b7355e-7f7f-8184-975d-fb18ca69875c` to `.env` (same for all langs)
   - Script translates from **IT source** (never from another translation), creates DB, returns DB ID
   - **NO CLAUDE/ANTHROPIC API for translation.** The `translate-notion.js` script calls the paid Anthropic API — do NOT use it. Instead, translate within Claude Code (subagents) and write to Notion via Notion API directly.
   - After run, hardcode the returned DB ID in `.env` as `NOTION_DATABASE_{LANG}_ID`
2. Create data files: `_data/permits{Lang}.js` and `_data/documents{Lang}.js`
   - **Hardcode the Notion database ID** (don't use env vars)
   - Slugs must match IT slugs (resolved via IT Page ID mapping)
3. Create pagination templates in `{lang}/src/pages/`:
   - `permits-{lang}.liquid`, `documents-primo-{lang}.liquid`, `documents-rinnovo-{lang}.liquid`
   - Permalink pattern: `{lang}/permesso-{{ permit.slug }}.html` etc.
4. Create static pages: `{lang}/index.html`, `{lang}/src/pages/database.html`, `{lang}/src/pages/documenti-questura.html`
   - **Use root-relative links** (e.g., `database.html`, NOT `src/pages/database.html`)
   - **Use correct Notion-derived slugs** (copy from IT versions, they're the same)
   - **Asset paths** from `{lang}/index.html`: use `IMAGES/...`, `src/styles/...` (no `../` prefix)
   - **Non-Latin scripts** (Bengali, Chinese, Arabic): add font CSS (see `src/styles/cjk.css` pattern)
5. Update `eleventy.config.mjs` to ignore old static files for the new language
6. Update language switcher, nav, hreflang tags, sitemap
7. **Run translation quality review** (see below)

### Subagent Translation Pipeline

The "translate within Claude Code subagents" rule above is a manual workflow that wraps `scripts/translate-to-notion.js`. The repo's scripts only handle the bookends; the middle is orchestrated ad-hoc by Claude Code. Files land in `_cache/`:

| File pattern | Produced by | Keep? |
|---|---|---|
| `translate-{lang}-texts.json` | `translate-to-notion.js --extract` | **Keep** — record of IT source extracted. |
| `translate-batch-N.json` (no lang prefix) | Claude Code orchestrator (splits texts.json into 6 chunks) | Delete after merge — pure scratch. |
| `translate-{lang}-batch-N-M.json` | Parallel subagents (3 × 2 chunks each) | Delete after merge — contents already in `done.json`. |
| `translate-{lang}-done.json` | Orchestrator merges batch outputs | **Keep** — the file `translate-to-notion.js` reads. **Only recovery path if the target Notion DB is wiped** (no reverse mode exists in the script). |
| `translate-{lang}-missing.json` | Orchestrator diff of texts.json vs done.json | Delete after retry — pure scratch. |
| `translate-{lang}-missing-done.json` | Subagent retry pass | Delete after merging into `done.json` — contents already there. |
| `translate-{lang}-remaining.txt` | Earlier abandoned pass | Delete — pure scratch. |

Workflow:
1. `node scripts/translate-to-notion.js --lang {code} --extract` — produces `_cache/translate-{lang}-texts.json`.
2. Split into 6 chunks (`_cache/translate-batch-0.json` ... `5.json`); dispatch 3 parallel Claude Code subagents, each handling 2 chunks; each writes `_cache/translate-{lang}-batch-N-M.json`.
3. Merge all subagent outputs into `_cache/translate-{lang}-done.json` (`{IT-string: translated-string}` map).
4. Diff texts.json vs done.json → write missing keys to `_cache/translate-{lang}-missing.json`, dispatch retry subagent, write `_cache/translate-{lang}-missing-done.json`, merge into `done.json`.
5. `node scripts/translate-to-notion.js --lang {code}` (no `--extract`) — reads `done.json`, writes translated pages to the target Notion DB.
6. **Cleanup**: delete the scratch files. The patterns `_cache/translate-batch-*.json`, `_cache/translate-*-batch-*.json`, `_cache/translate-*-missing*.json`, `_cache/translate-*-remaining*.txt` are in `.gitignore` so they won't be committed if forgotten — but they still accumulate locally. `rm` them after a run.

`done.json` and `texts.json` are not in `.gitignore` and are committed for cross-machine recovery (the only path back if a target Notion DB is corrupted).

### Translation Quality Review

The translation review pipeline shares its rules, prompts, and outputs with the sibling project `app/` (Next.js decision-tree app). The canonical home is a sibling directory:

```
~/Desktop/TECH/SOSpermesso/translations-shared/
├── glossaries/{lang}.js     ← term rules (register, badTerms, preservedTerms)
├── prompts/                 ← reusable AI subagent prompt templates
│   └── ai-review-prompt.md
└── review-reports/
    ├── app/                 ← sibling app's review outputs (Next.js decision tree)
    └── sito-nuovo/          ← THIS project's review outputs
```

In this project, the following paths are **symlinks** into the shared directory:
- `Sito_Nuovo/scripts/glossaries/`  → `translations-shared/glossaries/`
- `Sito_Nuovo/review-reports/`      → `translations-shared/review-reports/sito-nuovo/`

**Do not edit through the symlinks** — edit at the canonical `translations-shared/` location for clarity. Edits via the symlinks land in the shared directory anyway, but path references should use the `translations-shared/` form.

After adding or updating a language, run a quality review:

```bash
npm run fetch -- --lang {code}   # refresh cache from Notion
npm run review -- --lang {code}  # automated checks + AI review payload
```

Outputs (all under `translations-shared/review-reports/sito-nuovo/`):
- `{lang}-automated.md` — automated issues (bad terms, register, incomplete sentences, artifacts, duplications)
- `{lang}-for-ai-review.json` — full Q&A + static page text in batches of 6, ready for parallel AI review agents
- `{lang}-batch-{N}.txt` — flat-text batches for AI subagents

**Scripts (project-local — kept separate from `app/`):**
- `scripts/review-translations.js` — main CLI, reads Notion cache. The sibling `app/scripts/review-translations.js` does the same job but reads flat JSON instead of Notion cache; the two are kept separate because their inputs differ.
- `scripts/glossaries/{lang}.js` — symlinked from `translations-shared/glossaries/`. **Add confirmed mistakes here after each review** so they're caught automatically next time, in BOTH projects.
- `scripts/fix-{lang}-translations.js` — applies `BAD_TERMS` arrays to Notion. App's equivalent fix script reads the same arrays via `require()` so corrections propagate to both products.

**3-phase workflow:**
1. **Automated check** (`npm run review`) — regex/glossary pass. Catches known bad terms, register violations, dangling sentences, artifacts.
2. **AI review** — Claude Code subagents read the shared prompt template at `translations-shared/prompts/ai-review-prompt.md` plus the per-batch `.txt` files. Outputs `{lang}-ai-review.md` with CRITICAL/HIGH/MEDIUM/LOW + SYSTEMIC structure. The sibling `app` project uses these as priors for its own review (so don't re-author findings already discovered here).
3. **Human spot-check** — native speaker, final gate, focuses on what AI missed.

**Feedback loop:** confirmed bad-term findings get folded back into `translations-shared/glossaries/{lang}.js`. Both projects benefit automatically on the next automated run.

**Glossary format** (`translations-shared/glossaries/{lang}.js`):
```js
module.exports = {
  register: { formal: 'siz', informal: 'sen' },  // null for EN/BN
  badTerms: [{ wrong: '...', correct: '...', source: '...', note: '...' }],
  preservedTerms: ['Questura', 'Prefettura', ...],  // informational only
  incompleteSentencePatterns: [],  // language-specific regex patterns
};
```

**Do NOT** check for absence of preserved terms — a page about family reunification has no reason to mention "C3". Only flag when a *translated form* of a preserved term appears (use `badTerms`).

## Mobile Optimization

### Critical Fixes (mobile-fix.css)
- **Prevent horizontal scroll**: `overflow-x: hidden` on html/body
- **Container width**: 100% max-width with proper padding
- **Lighthouse scaling**: 260px → 220px → 180px (landscape)
- **Grid collapse**: All grids become single column
- **Typography scaling**: Responsive font sizes
- **Touch targets**: Minimum 44x44px for all interactive elements
- **Header optimization**: Compact logo, visible menu toggle

### Responsive Breakpoints
- Desktop: > 768px
- Tablet/Mobile: ≤ 768px
- Small Mobile: ≤ 480px
- Landscape Mobile: ≤ 768px and orientation landscape

## Components Deep Dive

### Card Component
```css
.card {
  background: linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.card::before {
  /* Rainbow gradient top border (visible on hover) */
  background: linear-gradient(90deg,
    var(--taxi-yellow) 0%,
    var(--accent-orange) 25%,
    var(--accent-pink) 50%,
    var(--accent-purple) 75%,
    var(--accent-blue) 100%);
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.3);
}
```

### Button Component
```css
.btn-primary {
  background: linear-gradient(135deg,
    var(--taxi-yellow-bright) 0%,
    var(--taxi-yellow) 100%);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
}
```

## Animations

### Lighthouse Animations
- `rotate-beam`: Light beam rotation (4s linear infinite)
- `wave-flow`: Ocean waves movement (3s ease-in-out infinite)
- `light-pulse`: Light pulsing effect (2s ease-in-out infinite)
- `eye-blink`: Eye blinking (4s ease-in-out infinite)
- `sway`: Gentle sway on hover (2s ease-in-out infinite)

### Paperwork Illustration Animations
- `float-paper`: Paper floating up and down (3s ease-in-out infinite)
- `wave-hand`: Hand waving (2s ease-in-out infinite)
- `bob-head`: Head bobbing (2.5s ease-in-out infinite)

### UI Animations
- `fadeIn`: Opacity 0 → 1 (modal backdrop)
- `slideUp`: TranslateY 30px → 0 (modal content)
- `bounce`: Translate Y 0 → -10px → 0 (contact icon)
- `spin`: Rotate 360deg (loading spinner)

## Integration Points

### External Services
1. **Typeform** - Test/Quiz forms
   - "Posso AVERE un permesso?" - https://form.typeform.com/to/kt7P9Ejk
   - "Posso CONVERTIRE?" - https://form.typeform.com/to/oc9jhdkJ
   - "Posso RINNOVARE il permesso?" - https://form.typeform.com/to/R7HY8nBp
   - "Segnala un errore" - https://form.typeform.com/to/FsqvzdXI
   - "Dai una mano" / Contatti - https://form.typeform.com/to/USx16QN3

### Navigation Structure
Header navigation includes 4 dropdowns:
- **Database**: Database di permessi, Documenti Questura
- **Guide**: Protezione internazionale, Ricongiungimento familiare, Dizionario
- **Test**: Posso AVERE?, Posso CONVERTIRE?, Posso RINNOVARE?
- **Collabora**: Segnala un errore, Dai una mano, Il progetto

2. **Google Fonts**
   - Inter: 400, 500, 600, 700
   - Poppins: 600, 700, 800

### Contact & Error Reporting
- Contact form: Typeform embed (https://form.typeform.com/to/USx16QN3)
- Error reporting: "Segnala errore" button on all content pages → Typeform (pre-filled with page URL)
- No custom backend for contact — Typeform handles submissions

## Future Development

**Check local docs first:**
- `.planning/PROJECT.md` — current milestone, phase plan, technical debt
- `.planning/TODO-permits.md` — permits needing content (auto-generated)

**Current priority order:**
1. Prassi locali MVP (crowdsourced questura notes)
2. Permit pages → 11ty + content population
3. Content validation
4. Translation batch (after content is solid)

## Technical Notes

### Build System
- **11ty v3.1.2** with Liquid templates for static site generation
- **Notion API** powers document and permit page content
- **Combined build:** `npm run build` chains Notion content fetch + 11ty
- **Output:** `_site/` directory, deployed to Netlify
- **Incremental builds:** Content hashing (MD5) for change detection

### CSS Variables System
All colors, spacing, typography, shadows, and transitions are defined as CSS variables in `:root`.

### Component Architecture
Components are 11ty includes in `_includes/`:
- `layouts/base.liquid` — base HTML structure (head, scripts, shared elements)
- `header.liquid`, `footer.liquid`, `nav.liquid`, `language-switcher.liquid`
- Pages reference layouts via front matter: `layout: layouts/base.liquid`

### Mobile-First Approach
All base styles are designed for mobile, then enhanced for larger screens using media queries.

### Accessibility Features
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast ratios for text
- Touch-friendly tap targets (44x44px minimum)
- Focus states on all interactive elements

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- CSS Grid and Flexbox required
- SVG support required for lighthouse and illustrations

## Performance Considerations
- Inline critical CSS for lighthouse
- Lazy loading for components
- Optimized SVG files
- Minimal external dependencies
- Mobile-optimized images and animations

## Credits & Resources
- Icons: Emoji unicode characters
- Fonts: Google Fonts (Inter, Poppins)
- Color inspiration: Material Design color palette
- Lighthouse mascot: Custom SVG illustration
- Paperwork illustrations: Custom SVG illustrations

---

**Last Updated**: 2026-02-07
**Version**: 3.0
**Built with**: 11ty v3.1.2 (Liquid), CSS, JavaScript (Vanilla), Node.js build scripts, Notion API, Netlify
