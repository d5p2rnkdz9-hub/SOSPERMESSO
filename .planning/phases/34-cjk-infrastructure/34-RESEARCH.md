# Phase 34: CJK Infrastructure - Research

**Researched:** 2026-02-04
**Domain:** CSS CJK (Chinese, Japanese, Korean) typography with font stacks and text handling
**Confidence:** HIGH

## Summary

CJK infrastructure for Chinese, Japanese, and Korean requires specialized font stacks, adjusted line-height for dense characters, disabled italics (replaced with text-emphasis marks), and proper word-break rules for character-based languages. Unlike RTL (which requires logical properties), CJK is primarily a typography and text-flow challenge.

Key findings: CJK languages don't use italics or uppercase, requiring `font-style: normal` overrides and optional `text-emphasis` dots for emphasis. Chinese/Japanese break at any character (no word boundaries), while Korean uses spaces. Line-height needs to be 1.7-1.8 for readability due to character density. System font stacks are preferred over web fonts to avoid 15MB+ downloads.

**Primary recommendation:** Create `cjk.css` with Chinese font stack (PingFang SC, Microsoft YaHei, Noto Sans SC), disable italics via `[lang="zh"] { font-style: normal; }`, set line-height: 1.7-1.8, and use `word-break: normal` (default browser behavior breaks correctly at any Chinese character).

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS font-family | CSS3 | CJK font specification | Native CSS, zero dependencies |
| CSS line-height | CSS1 | Vertical spacing for dense characters | Standard CSS property |
| CSS word-break | CSS3 | Character-level breaking for Chinese/Japanese | W3C standard, 98%+ browser support |
| CSS text-emphasis | CSS3 | East Asian emphasis marks (alternative to italics) | W3C standard for CJK emphasis |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Google Fonts (Noto Sans CJK) | Variable | Universal CJK font | Only if custom branding requires it (15MB+ download) |
| Font subsetting tools | - | Reduce CJK font size | Only if serving web fonts (not needed for system fonts) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| System font stack | Noto Sans CJK web font | 15MB+ download vs instant render with system fonts |
| font-style: normal override | Keep italics | CJK characters look distorted/wrong when italicized |
| text-emphasis dots | Bold for emphasis | Bold works but dots are culturally appropriate for CJK |
| word-break: normal | word-break: break-all | break-all is redundant for Chinese/Japanese (default already breaks at characters) |

**Installation:**
```bash
# No installation needed - CSS native features
# Optional: If using Noto Sans CJK web fonts
npm install noto-sans-cjk-fonts
```

## Architecture Patterns

### Recommended Project Structure
```
src/styles/
├── main.css              # Add CJK-safe defaults if needed
├── components.css        # Audit for italic usage
├── rtl.css               # RTL infrastructure (Phase 33)
└── cjk.css               # NEW: CJK-specific typography rules
```

### Pattern 1: CJK Font Stack Definition
**What:** Define system font stacks for Chinese, Japanese, Korean with fallbacks
**When to use:** All CJK language pages via `[lang="zh"]`, `[lang="ja"]`, `[lang="ko"]` selectors
**Example:**
```css
/* Source: Wiredcraft Chinese Webfonts Guide, AZ Loc Asian Fonts */
/* Chinese (Simplified) */
[lang="zh"],
[lang="zh-CN"] {
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Hiragino Sans GB", sans-serif;
}

/* Japanese */
[lang="ja"] {
  font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", "Meiryo", sans-serif;
}

/* Korean */
[lang="ko"] {
  font-family: "Noto Sans KR", "Nanum Gothic", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
}
```

### Pattern 2: Disable Italics for CJK
**What:** Override italic styling with normal + optional text-emphasis marks
**When to use:** All elements with `font-style: italic` when CJK language is detected
**Example:**
```css
/* Source: W3C Styling using language attributes */
/* Default italic for Latin text */
em, .hero-tagline, .disputed-note {
  font-style: italic;
}

/* Override for CJK - italics don't exist in these languages */
em:lang(zh),
.hero-tagline:lang(zh),
.disputed-note:lang(zh) {
  font-style: normal;
  /* Optional: Add emphasis dots (culturally appropriate) */
  text-emphasis: dot;
  text-emphasis-position: under right; /* Chinese preference */
}

em:lang(ja),
.hero-tagline:lang(ja),
.disputed-note:lang(ja) {
  font-style: normal;
  text-emphasis: dot;
  text-emphasis-position: over right; /* Japanese preference */
}

/* Korean typically uses bold instead of dots */
em:lang(ko),
.hero-tagline:lang(ko),
.disputed-note:lang(ko) {
  font-style: normal;
  font-weight: 700;
}
```

### Pattern 3: Line-Height for CJK Readability
**What:** Increase line-height for dense character sets with vertical metrics
**When to use:** Body text and headings in CJK languages
**Example:**
```css
/* Source: Typotheque CJK Typesetting Principles */
/* Latin text - standard line-height */
body {
  line-height: 1.6;
}

/* CJK text - extra space for readability */
[lang="zh"],
[lang="ja"],
[lang="ko"] {
  line-height: 1.8; /* 1.7-1.8 recommended for CJK */
}

/* CJK headings - slightly tighter */
[lang="zh"] h1, [lang="zh"] h2, [lang="zh"] h3,
[lang="ja"] h1, [lang="ja"] h2, [lang="ja"] h3,
[lang="ko"] h1, [lang="ko"] h2, [lang="ko"] h3 {
  line-height: 1.5; /* Still more than Latin 1.2-1.3 */
}
```

### Pattern 4: Word-Break for Chinese/Japanese
**What:** Allow character-level line breaking for languages without word boundaries
**When to use:** Chinese and Japanese text (Korean uses spaces like English)
**Example:**
```css
/* Source: MDN word-break, W3C CSS Text Module */
/* Chinese and Japanese - break at any character (default behavior) */
[lang="zh"],
[lang="ja"] {
  word-break: normal; /* Browser default already breaks at characters */
  overflow-wrap: break-word; /* Safety for long URLs/strings */
}

/* Korean - uses spaces between words like English */
[lang="ko"] {
  word-break: normal; /* Standard word boundaries */
  overflow-wrap: break-word; /* Safety for long URLs/strings */
}

/* AVOID: word-break: break-all for CJK */
/* Chinese/Japanese browsers already break at characters by default */
/* break-all would also break embedded English words mid-word (undesirable) */
```

### Pattern 5: Text-Emphasis Marks (Optional Enhancement)
**What:** Add culturally appropriate emphasis marks instead of italics/bold
**When to use:** Emphasized text (`<em>`, italicized classes) in Japanese/Chinese
**Example:**
```css
/* Source: W3C CSS3 Text Module, CSS-Tricks text-emphasis */
/* Japanese emphasis - dots above right */
em:lang(ja) {
  font-style: normal;
  text-emphasis: dot;
  text-emphasis-position: over right; /* Above in horizontal, right in vertical */
  text-emphasis-color: currentColor; /* Match text color */
}

/* Chinese emphasis - dots below right */
em:lang(zh) {
  font-style: normal;
  text-emphasis: sesame; /* Alternative: filled sesame dots */
  text-emphasis-position: under right; /* Below in horizontal */
}

/* Common emphasis mark shapes:
   - dot: Simple circle
   - sesame: Filled sesame seed shape (traditional)
   - circle: Hollow circle
   - double-circle: Double circle (strong emphasis)
*/
```

### Anti-Patterns to Avoid
- **Using web fonts for CJK without subsetting:** Full CJK font files are 15MB+, causing massive performance hit
- **Applying letter-spacing to CJK:** Disconnects connected characters, makes text harder to read
- **Using word-break: keep-all for Chinese/Japanese:** Causes horizontal overflow since there are no word boundaries
- **Forcing italics on CJK text:** Characters become distorted and unreadable - italics don't exist in CJK typography
- **Line-height < 1.6 for CJK:** Characters are dense and need vertical breathing room
- **Hyphenation for CJK:** Hyphenation doesn't apply to character-based languages

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CJK font detection | JavaScript to detect language and load fonts | CSS `[lang="zh"]` selector with system fonts | Zero JS, instant render, no FOUT |
| Custom emphasis styling | JavaScript to add decorative elements | CSS `text-emphasis` property | Native browser support, semantic HTML |
| Character-level wrapping | JavaScript to insert `<wbr>` tags between characters | Browser default `word-break: normal` | CJK browsers already do this automatically |
| Font subsetting service | Custom build pipeline to subset CJK fonts | System font stack (PingFang, YaHei, Hiragino) | Pre-installed, zero download, perfect coverage |

**Key insight:** System fonts for CJK are excellent (PingFang on Mac, Microsoft YaHei on Windows, Noto on Android/Linux) and cover 99% of use cases. Web fonts should only be used for branding and must be heavily subsetted (character ranges, not full font).

## Common Pitfalls

### Pitfall 1: Line-Height Too Tight
**What goes wrong:** CJK characters appear cramped with insufficient vertical space between lines.
**Why it happens:** Line-height optimized for Latin text (1.4-1.6) is too tight for dense CJK characters.
**How to avoid:** Use line-height: 1.7-1.8 for CJK body text, test with actual content.
**Warning signs:** Characters touching vertically, reduced readability, text appearing "heavy".

### Pitfall 2: Keeping Italics for CJK
**What goes wrong:** Italic styles applied to CJK text make characters look distorted, tilted, or broken.
**Why it happens:** Developers forget that italics are a Latin-script convention with no CJK equivalent.
**How to avoid:** Add `[lang="zh"] { font-style: normal; }` overrides for all italic selectors.
**Warning signs:** CJK text appearing slanted or deformed, especially in emphasized sections.

### Pitfall 3: Using word-break: keep-all for Chinese
**What goes wrong:** Long Chinese text causes horizontal overflow because there are no word boundaries to break at.
**Why it happens:** Misunderstanding that `keep-all` prevents breaking "words" - but Chinese has no spaces between words.
**How to avoid:** Use `word-break: normal` (default) for Chinese/Japanese, which breaks at any character.
**Warning signs:** Horizontal scrolling on mobile, text overflowing containers, unreadable long paragraphs.

### Pitfall 4: Web Fonts Without Subsetting
**What goes wrong:** Loading full Noto Sans CJK fonts adds 15MB+ to page weight, destroying performance.
**Why it happens:** Treating CJK fonts like Latin fonts (typical web font is <100KB, but CJK is 15MB+).
**How to avoid:** Use system font stack, or subset web fonts to only characters actually used on page.
**Warning signs:** Slow page load, poor Lighthouse scores, FOUT (flash of unstyled text).

### Pitfall 5: Letter-Spacing on CJK
**What goes wrong:** Adding letter-spacing to CJK text creates unnatural gaps between characters, harming readability.
**Why it happens:** Letter-spacing works for Latin text but disrupts the visual density of CJK characters.
**How to avoid:** Never use letter-spacing on CJK text, override any global letter-spacing with `letter-spacing: normal`.
**Warning signs:** CJK text appearing "spaced out" or "loose", reduced readability.

### Pitfall 6: Embedding CJK in Latin Font Stack
**What goes wrong:** CJK characters render in fallback system UI font that doesn't match Latin font aesthetics.
**Why it happens:** Latin fonts (Inter, Poppins) don't include CJK characters, browser falls back to default.
**How to avoid:** Use language-specific font stacks with `[lang="zh"]` selector, not one global stack.
**Warning signs:** CJK text rendering in Arial/SimSun while Latin text uses custom fonts, inconsistent typography.

## Code Examples

Verified patterns from official sources:

### Complete CJK Typography Setup
```css
/* Source: W3C CSS3 Text, Typotheque CJK Typesetting */

/* Chinese (Simplified) - Mainland China */
[lang="zh"],
[lang="zh-CN"] {
  font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", "Hiragino Sans GB", sans-serif;
  line-height: 1.8;
  letter-spacing: normal !important; /* Never add letter-spacing */
}

/* Chinese (Traditional) - Taiwan, Hong Kong */
[lang="zh-TW"],
[lang="zh-HK"] {
  font-family: "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", "Hiragino Sans CNS", sans-serif;
  line-height: 1.8;
  letter-spacing: normal !important;
}

/* Japanese */
[lang="ja"] {
  font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", "Meiryo", sans-serif;
  line-height: 1.8;
  letter-spacing: normal !important;
}

/* Korean */
[lang="ko"] {
  font-family: "Noto Sans KR", "Nanum Gothic", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif;
  line-height: 1.7; /* Korean can be slightly tighter than Chinese/Japanese */
  letter-spacing: normal !important;
}
```

### Disable Italics with Language Selectors
```css
/* Source: W3C Styling using language attributes */

/* Find all italic selectors in existing CSS:
   - em, i (semantic HTML)
   - .hero-tagline (components.css:1117)
   - .disputed-note (document-page.css:152)
*/

/* Method 1: Specific overrides for each selector */
em:lang(zh), em:lang(ja), em:lang(ko),
.hero-tagline:lang(zh), .hero-tagline:lang(ja), .hero-tagline:lang(ko),
.disputed-note:lang(zh), .disputed-note:lang(ja), .disputed-note:lang(ko) {
  font-style: normal;
}

/* Method 2: Global override (simpler, covers all cases) */
[lang="zh"] em,
[lang="zh"] i,
[lang="zh"] .hero-tagline,
[lang="zh"] .disputed-note,
[lang="ja"] em,
[lang="ja"] i,
[lang="ja"] .hero-tagline,
[lang="ja"] .disputed-note,
[lang="ko"] em,
[lang="ko"] i,
[lang="ko"] .hero-tagline,
[lang="ko"] .disputed-note {
  font-style: normal;
}

/* Method 3: Universal override (catches everything) */
[lang="zh"] *,
[lang="ja"] *,
[lang="ko"] * {
  font-style: normal !important;
}
```

### Word-Break for Character-Based Languages
```css
/* Source: MDN word-break, W3C Approaches to line breaking */

/* Chinese & Japanese - break at any character */
[lang="zh"],
[lang="ja"] {
  word-break: normal; /* Default browser behavior already correct */
  overflow-wrap: break-word; /* Safety for URLs and long strings */
}

/* Korean - uses word boundaries like English */
[lang="ko"] {
  word-break: normal; /* Standard word-based breaking */
  overflow-wrap: break-word; /* Safety for URLs */
}

/* Override existing word-break: keep-all for CJK */
/* Current codebase has .card h2 with word-break: keep-all */
.card h2:lang(zh),
.card h2:lang(ja) {
  word-break: normal; /* Allow character-level breaking */
}
```

### Text-Emphasis for CJK Emphasis (Optional)
```css
/* Source: W3C CSS Text Decoration Module Level 3, CSS-Tricks */

/* Japanese - dots above (over right) */
em:lang(ja),
[lang="ja"] .hero-tagline {
  font-style: normal;
  text-emphasis: dot;
  text-emphasis-position: over right;
  /* over right = above in horizontal text, right side in vertical text */
}

/* Chinese - dots below (under right) */
em:lang(zh),
[lang="zh"] .hero-tagline {
  font-style: normal;
  text-emphasis: sesame; /* Traditional filled sesame dots */
  text-emphasis-position: under right;
  /* under right = below in horizontal text, right side in vertical text */
}

/* Korean - bold instead of dots */
em:lang(ko),
[lang="ko"] .hero-tagline {
  font-style: normal;
  font-weight: 700; /* Korean doesn't traditionally use emphasis dots */
}
```

### Headings with Adjusted Line-Height
```css
/* Source: Typotheque CJK Typesetting Principles */

/* CJK headings need more space than Latin headings */
[lang="zh"] h1, [lang="zh"] h2, [lang="zh"] h3, [lang="zh"] h4,
[lang="ja"] h1, [lang="ja"] h2, [lang="ja"] h3, [lang="ja"] h4,
[lang="ko"] h1, [lang="ko"] h2, [lang="ko"] h3, [lang="ko"] h4 {
  line-height: 1.5; /* vs 1.2-1.3 for Latin */
}

/* Large display text can be slightly tighter */
[lang="zh"] .hero-title,
[lang="ja"] .hero-title,
[lang="ko"] .hero-title {
  line-height: 1.4;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Web fonts for all CJK | System font stack (PingFang, YaHei, Hiragino) | Ongoing best practice | Zero download, instant render, excellent coverage |
| Keep italics for CJK | `font-style: normal` override | Always been wrong, now documented | Proper typography, readable text |
| Manual `<wbr>` tags for breaking | Browser default word-break behavior | CSS3 (2010s) | Automatic character-level breaking for Chinese/Japanese |
| JavaScript font detection | CSS `[lang]` selectors | HTML5 semantic markup | Zero JS, works without JavaScript |
| Bold for CJK emphasis | `text-emphasis` dots/marks | CSS3 Text Decoration Level 3 (2019+) | Culturally appropriate emphasis |

**Deprecated/outdated:**
- Loading full Noto Sans CJK (15MB+) without subsetting
- Using `word-break: break-all` for CJK (redundant, breaks embedded Latin words)
- Applying letter-spacing to CJK text
- One global font stack for all languages (leads to fallback font mismatches)

## Open Questions

Things that couldn't be fully resolved:

1. **Vertical Text Layout**
   - What we know: Chinese/Japanese can be written vertically (top-to-bottom, right-to-left columns)
   - What's unclear: Whether SOS Permesso will ever need vertical text layout for formal documents
   - Recommendation: Skip vertical text support unless explicitly required - `writing-mode: vertical-rl` can be added later if needed

2. **Text-Emphasis Browser Support**
   - What we know: `text-emphasis` is CSS3 standard with good browser support
   - What's unclear: Exact browser versions supporting it, whether it's safe to use as primary emphasis method
   - Recommendation: Use as progressive enhancement - CJK users with modern browsers get dots, older browsers get normal text (italics already disabled)

3. **Chinese Regional Font Differences**
   - What we know: Simplified (PingFang SC, YaHei) vs Traditional (PingFang TC, JhengHei) use different character sets
   - What's unclear: Whether SOS Permesso will support both Simplified and Traditional Chinese, or just Simplified
   - Recommendation: Start with Simplified Chinese (`lang="zh"` or `lang="zh-CN"`) as it's more common for mainland audience

4. **Font Stack Order for Mixed Content**
   - What we know: Pages may have mixed Latin + CJK content (Italian permit names + Chinese translations)
   - What's unclear: Optimal font stack order to maintain visual harmony between Latin and CJK
   - Recommendation: Use language-specific stacks (`[lang="zh"]`) rather than global stack - preserves existing Latin typography

## Existing Codebase Issues

### Italic Usage Locations
Based on grep search, these selectors use `font-style: italic`:
- `src/styles/document-page.css:152` - `.disputed-note`
- `src/styles/components.css:1117` - `.hero-tagline`

**Action needed:** Add CJK overrides for both selectors in `cjk.css`

### Word-Break Conflicts
Based on grep search, existing word-break rules:
- `src/styles/components.css` - `word-break: keep-all` (likely `.card h2` for preventing title breaks)
- `src/styles/mobile-fix.css` - `word-break: normal !important`

**Action needed:** Add CJK-specific overrides to allow character-level breaking in Chinese/Japanese

### No CJK-Specific Styling
Current codebase has no `[lang="zh"]`, `[lang="ja"]`, or `[lang="ko"]` selectors.

**Action needed:** Create new `src/styles/cjk.css` file with all CJK infrastructure

## Implementation Strategy

Based on Phase 33 (RTL) pattern, Phase 34 should:

1. **Create `src/styles/cjk.css`** with:
   - Font stacks for Chinese, Japanese, Korean
   - Line-height adjustments (1.7-1.8)
   - Italic overrides (`font-style: normal`)
   - Word-break rules
   - Optional text-emphasis styling

2. **Include `cjk.css` in HTML** (similar to `rtl.css`):
   ```html
   <link rel="stylesheet" href="src/styles/cjk.css">
   ```

3. **Test with language attribute**:
   ```html
   <html lang="zh">
   ```

4. **Verification**:
   - Add `lang="zh"` to test page → Chinese fonts load
   - Italic text (.hero-tagline, .disputed-note) → renders normal (not slanted)
   - Long Chinese paragraph → wraps correctly at character boundaries
   - Line spacing → appears comfortable (not cramped)

## Sources

### Primary (HIGH confidence)
- [Typotheque: Typesetting principles of CJK text](https://www.typotheque.com/articles/typesetting-cjk-text) - Line-height, spacing, typography principles
- [W3C: Styling using language attributes](https://www.w3.org/International/questions/qa-css-lang/1000) - Language selector patterns, italic override example
- [W3C: CSS and International Text](https://www.w3.org/International/articles/css3-text/) - Text-emphasis, word-break, CJK-specific properties
- [MDN: word-break](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/word-break) - Word-break values and CJK behavior
- [W3C: Approaches to line breaking](https://w3c.github.io/i18n-drafts/articles/typography/linebreak.en) - Character-level breaking for Chinese/Japanese

### Secondary (MEDIUM confidence)
- [Wiredcraft: Chinese Font-Family by Safe Font](https://wiredcraft.com/blog/chinese-webfonts-font-family/) - PingFang, YaHei font stack recommendations
- [AZ Loc: Best Chinese Fonts for Websites](https://www.az-loc.com/choose-best-chinese-fonts-for-websites/) - Font stack examples, performance considerations
- [AZ Loc: 7 Asian Fonts That Actually Work](https://www.az-loc.com/best-fonts-for-chinese-japanese-korean-websites/) - Multi-language CJK font recommendations
- [Asian Absolute: CJK Typesetting in 2025](https://asianabsolute.co.uk/blog/cjk-typesetting-challenges-workflows-and-best-practices/) - Modern best practices, workflows
- [CSS-Tricks: text-emphasis](https://css-tricks.com/almanac/properties/t/text-emphasis/) - Text-emphasis property usage

### Tertiary (LOW confidence)
- [Snook: Notes on Font Stacks for CJK](https://snook.ca/archives/html_and_css/cjk-font-stack-notes) - Platform-specific font recommendations
- [Google Fonts Knowledge: CJK Typesetting Rules](https://fonts.google.com/knowledge/type_in_china_japan_and_korea/cjk_typesetting_rules) - General principles
- [GitHub: Noto CJK fonts](https://github.com/notofonts/noto-cjk) - Noto Sans CJK documentation, file sizes
- Stack Overflow: Various CJK typography discussions - Community patterns, common issues

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - System fonts are proven best practice, text-emphasis is W3C standard
- Architecture: HIGH - W3C provides authoritative patterns for CJK styling
- Pitfalls: HIGH - Well-documented issues (italic distortion, line-height, web font size)

**Research date:** 2026-02-04
**Valid until:** 2026-03-04 (30 days - stable CSS specs and font ecosystem)

---

## Comparison to Phase 33 (RTL)

| Aspect | Phase 33: RTL | Phase 34: CJK |
|--------|---------------|---------------|
| **Primary challenge** | Layout mirroring (left↔right) | Typography & text wrapping |
| **CSS property changes** | Physical → Logical properties | Font stacks, line-height, word-break |
| **New CSS file** | `rtl.css` (128 lines) | `cjk.css` (estimated 80-100 lines) |
| **HTML attribute** | `dir="rtl"` | `lang="zh"` / `lang="ja"` / `lang="ko"` |
| **Browser behavior** | Auto-mirror with logical properties | Auto-break at characters (Chinese/Japanese) |
| **Font stack** | Arabic fonts (Geeza Pro, Arabic Typesetting) | CJK fonts (PingFang, YaHei, Hiragino, Noto) |
| **Complexity** | HIGH (layout system change) | MEDIUM (typography overrides) |
| **Files modified** | 6 CSS files (converted to logical) | 2-3 CSS files (italic overrides only) |
| **Testing** | Add `dir="rtl"` → layout flips | Add `lang="zh"` → fonts/spacing change |

**Key difference:** RTL required converting the entire CSS layout system to logical properties. CJK only requires typography overrides - much simpler scope.
