# Technology Stack for Static-Site Quiz System

**Project:** SOS Permesso - Proprietary Test System
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

For replacing 3 Typeform tests with a proprietary quiz system on a static HTML/CSS/JS site, **vanilla JavaScript is the recommended approach**. The project's existing patterns, constraints (no backend, static hosting on Netlify), and scope (3 simple branching quizzes) make external libraries unnecessary overhead.

## Recommended Stack

### Core Approach: Vanilla JavaScript + JSON

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vanilla JavaScript | ES2020+ | Quiz engine | No dependencies, matches existing codebase, full control |
| JSON files | N/A | Quiz definitions | Human-readable, easy to translate, matches existing `content-*.json` pattern |
| localStorage | Native | State persistence | Already used in project (checklists), no backend needed |
| CSS Variables | Native | Quiz styling | Matches existing design system in `src/styles/main.css` |

### Quiz Data Structure

```json
{
  "meta": {
    "id": "test-avere",
    "version": "1.0",
    "lang": "it"
  },
  "questions": {
    "q1": {
      "text": "Hai un visto d'ingresso valido?",
      "type": "single",
      "options": [
        { "id": "yes", "text": "Si", "next": "q2" },
        { "id": "no", "text": "No", "next": "result-no-visa" }
      ]
    },
    "q2": {
      "text": "Che tipo di visto hai?",
      "type": "single",
      "options": [
        { "id": "work", "text": "Lavoro", "next": "q3-work" },
        { "id": "study", "text": "Studio", "next": "q3-study" },
        { "id": "family", "text": "Famiglia", "next": "q3-family" }
      ]
    }
  },
  "results": {
    "result-no-visa": {
      "title": "Non puoi richiedere un permesso",
      "description": "Senza visto d'ingresso valido...",
      "links": [{ "text": "Scopri di piu", "url": "/src/pages/permesso-..." }]
    }
  }
}
```

### Multilingual Content Handling

| Approach | Implementation | Why |
|----------|---------------|-----|
| Separate JSON files | `quiz-avere-it.json`, `quiz-avere-en.json` | Matches existing `content-it.json`/`content-en.json` pattern |
| Language detection | Read from localStorage `sospermesso-lang` | Already implemented in `app.js` |
| URL structure | `/src/pages/test-avere.html` loads correct JSON based on lang | No duplicate HTML pages needed |

### State Management

| State Type | Storage | Purpose |
|------------|---------|---------|
| Current question | In-memory (JS variable) | Track position in quiz |
| Answer history | In-memory (array) | Enable back navigation |
| Quiz progress | localStorage | Resume incomplete quizzes (optional) |
| Language preference | localStorage | Already exists: `sospermesso-lang` |

## Alternatives Considered

| Option | Recommendation | Why Not |
|--------|---------------|---------|
| **SurveyJS** | DO NOT USE | Overkill - requires 50KB+ library for 3 simple quizzes; Form Library is MIT-free but Creator costs EUR 499; adds React/Preact dependency to vanilla JS project |
| **question-tree-core** | DO NOT USE | Adds npm dependency for simple branching logic; last updated 2023; project can implement same logic in <200 lines |
| **Typebot/Formbricks** | DO NOT USE | Self-hosted solutions require backend; contradicts static-site constraint |
| **OhMyForm** | DO NOT USE | Requires PostgreSQL/sqlite backend |
| **Custom Web Component** | CONSIDER LATER | Useful if quiz system grows beyond 3 tests; premature for current scope |

## File Structure

```
src/
  data/
    quizzes/
      test-avere-it.json      # Quiz 1: "Posso AVERE un permesso?"
      test-avere-en.json
      test-convertire-it.json # Quiz 2: "Posso CONVERTIRE?"
      test-convertire-en.json
      test-rinnovare-it.json  # Quiz 3: "Posso RINNOVARE?"
      test-rinnovare-en.json
  pages/
    test-avere.html           # Quiz pages (use same template)
    test-convertire.html
    test-rinnovare.html
  scripts/
    quiz.js                   # Quiz engine (~200 lines)
  styles/
    quiz.css                  # Quiz-specific styles
```

## Implementation Rationale

### Why Vanilla JS over Libraries

1. **Existing pattern**: Project uses vanilla JS throughout (`app.js`, `mobile.js`)
2. **Bundle size**: Zero added KB vs 50-150KB for SurveyJS/similar
3. **Maintenance**: No dependency updates, no breaking changes from upstream
4. **Control**: Full customization of UX matches design system exactly
5. **Simplicity**: 3 quizzes with branching logic is <200 lines of JS

### Why JSON over Notion for Quiz Content

1. **Version control**: Quiz logic in git, not external database
2. **Offline development**: No API calls during development
3. **Type safety**: JSON schema can be validated
4. **Translation workflow**: Same as existing content JSON files
5. **Performance**: Direct file load, no Notion API latency

### Why localStorage over URL Parameters

1. **Clean URLs**: `/test-avere.html` not `/test-avere.html?q=3&a=yes,work`
2. **Back button works**: Browser navigation intact
3. **Resume capability**: Users can return to incomplete quizzes
4. **Already used**: Project uses localStorage for checklist persistence

## Browser Support

Same as existing site:
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- ES2020 features (optional chaining, nullish coalescing)
- localStorage (universal support)

## What NOT to Add

| Technology | Why Avoid |
|------------|-----------|
| React/Vue/Angular | Contradicts vanilla JS architecture |
| npm dependencies | Adds build complexity, version management |
| TypeScript | Existing codebase is JS, would require build step |
| Backend API | Static site constraint |
| Database | localStorage sufficient for quiz state |
| CSS framework | Existing design system in main.css |
| Animation library | CSS animations already in animations.css |

## Migration Path from Typeform

| Current Typeform | New Location | Notes |
|-----------------|--------------|-------|
| `form.typeform.com/to/kt7P9Ejk` | `/src/pages/test-avere.html` | "Posso AVERE un permesso?" |
| `form.typeform.com/to/oc9jhdkJ` | `/src/pages/test-convertire.html` | "Posso CONVERTIRE?" |
| `form.typeform.com/to/R7HY8nBp` | `/src/pages/test-rinnovare.html` | "Posso RINNOVARE?" |

Update required in:
- `index.html` - Test section cards and nav dropdown
- `src/pages/*.html` - Header nav dropdown (template change)
- `src/data/content-*.json` - Test URLs

## Sources

- [SurveyJS Pricing](https://surveyjs.io/pricing) - Form Library is MIT-free, Creator requires commercial license
- [SurveyJS Licensing](https://surveyjs.io/licensing) - Perpetual licenses starting at EUR 499
- [question-tree-core](https://www.npmjs.com/package/question-tree-core) - ES6+ decision tree package (considered, not recommended)
- [SitePoint JavaScript Quiz Tutorial](https://www.sitepoint.com/simple-javascript-quiz/) - Vanilla JS quiz patterns
- [Hackr.io Quiz Tutorial](https://hackr.io/blog/how-to-build-a-javascript-quiz-app) - Step-by-step quiz implementation

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Vanilla JS recommendation | HIGH | Matches existing codebase, proven pattern |
| JSON structure | HIGH | Follows project's established content-*.json pattern |
| localStorage approach | HIGH | Already used in project for checklists |
| SurveyJS avoidance | HIGH | Verified licensing model and bundle size impact |
| Multilingual handling | HIGH | Mirrors existing translation file structure |

---
*Research conducted 2026-01-31 for v2.0 milestone*
