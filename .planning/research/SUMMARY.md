# Project Research Summary

**Project:** SOS Permesso - Proprietary Test System
**Domain:** Static-site quiz/decision tree for permit eligibility
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

Building a proprietary quiz system to replace 3 Typeform tests is a straightforward project with well-established patterns. The approach is clear: vanilla JavaScript + JSON data files, matching the existing codebase exactly. No libraries needed. The 3 quizzes ("Posso AVERE?", "Posso CONVERTIRE?", "Posso RINNOVARE?") are simple branching decision trees that guide users to relevant permit pages.

The recommended approach is a single `quiz.js` engine (~200 lines) that loads quiz definitions from JSON files and renders questions one at a time. This follows the project's existing patterns: static HTML pages in `src/pages/`, JSON content in `src/data/`, vanilla JavaScript in `src/scripts/`. The architecture supports multilingual content (IT + EN) using the same `content-{lang}.json` pattern already established.

The primary risks are scope creep and poor UX for stressed users. The team must resist building "a quiz builder" when only 3 specific tests are needed. For UX, the audience is immigrants navigating bureaucracy — calming design, clear progress indicators, and gentle error messages are essential, not nice-to-have.

## Key Findings

### Recommended Stack

**Core:** Vanilla JavaScript ES2020+ with JSON quiz definitions. Zero external dependencies.

**Core technologies:**
- **Vanilla JavaScript**: Quiz engine — matches existing codebase, full control, no bundle overhead
- **JSON files**: Quiz definitions — human-readable, git-versioned, easy to translate
- **localStorage**: State persistence — already used for checklists, enables resume capability
- **CSS variables**: Quiz styling — extends existing design system in `main.css`

**Avoid:** SurveyJS (50KB+ overhead, licensing issues), npm dependencies (adds build complexity), TypeScript (existing codebase is JS).

### Expected Features

**Must have (table stakes):**
- Step-by-step wizard flow (one question per screen)
- Branching logic based on answers
- Progress indicator (step counter: "2 of 5")
- Back/Next navigation
- Mobile-responsive design (reuse existing CSS)
- Clear result display with links to permit pages
- Calming visual design (anxious users)
- No time limits

**Should have (competitive):**
- Multilingual from day one (IT + EN)
- No response limits (Typeform caps at 10-100/month)
- No Typeform branding
- Direct links to relevant permit pages
- Contextual help tooltips
- Full keyboard navigation + screen reader support

**Defer (v2+):**
- Save/resume progress
- Print/PDF export
- Offline capability (PWA)
- Visual answer cards with images
- Additional languages (FR, ES, ZH)
- Analytics dashboard

### Architecture Approach

The quiz system integrates as a client-side JavaScript module. A single `quiz.js` file handles state management, navigation, and rendering. Quiz content lives in JSON files (`src/data/quizzes/test-{name}-{lang}.json`). HTML pages in `src/pages/test-{name}.html` serve as shells that load the quiz engine.

**File structure:**
```
src/
  data/quizzes/
    test-avere-it.json
    test-avere-en.json
    test-convertire-it.json
    test-convertire-en.json
    test-rinnovare-it.json
    test-rinnovare-en.json
  pages/
    test-avere.html
    test-convertire.html
    test-rinnovare.html
  scripts/
    quiz.js
  styles/
    quiz.css
```

**Major components:**
1. **quiz.js** — Quiz engine: state machine, navigation, rendering
2. **quiz-*.json** — Quiz definitions: questions, options, branching rules, results
3. **test-*.html** — Page shells: header, footer, quiz container
4. **quiz.css** — Quiz-specific styles extending design system

### Critical Pitfalls

1. **Scope creep** — Resist building a generic quiz builder; ship 3 specific tests. Lock scope with MoSCoW prioritization. Any "while we're at it" features go to v3.0 backlog.

2. **Confusing branching UX** — Users get lost in decision trees. Always show progress (step counter), enable back navigation, limit paths to 5-7 questions maximum.

3. **iOS zoom disaster** — Font size < 16px on inputs triggers Safari auto-zoom that breaks layout. Use 16px minimum for all form elements. Test on actual iOS devices.

4. **Anxiety-inducing errors** — Target users are stressed. Use friendly messages ("Please select an option") not harsh ones ("ERROR: Required"). No premature validation.

5. **Hardcoded Italian text** — Design for i18n from day 1. All user-facing strings in JSON files, not HTML/JS. Enables EN translation without refactoring.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation
**Rationale:** Core architecture must exist before any features
**Delivers:** quiz.js engine, JSON schema, one working quiz (test-avere) in Italian
**Addresses:** Branching logic, question rendering, result display
**Avoids:** Scope creep (by building minimal engine first)

Key tasks:
- Define JSON schema for quiz data
- Build quiz.js state machine (question navigation, back button)
- Create test-avere.html page shell
- Write test-avere-it.json content
- Implement result display with links to permit pages

### Phase 2: UX Polish
**Rationale:** Core flow works; now make it usable for anxious users
**Delivers:** Progress indicator, mobile optimization, calming design
**Addresses:** Table stakes UX features from FEATURES.md
**Avoids:** Confusing branching UX, iOS zoom, anxiety-inducing errors

Key tasks:
- Add progress indicator (step counter)
- Ensure 16px minimum font on all inputs
- Test on iOS Safari
- Design calming error states
- Add "Start Over" button
- Add contextual help tooltips

### Phase 3: Multilingual
**Rationale:** i18n structure should be in place before adding more quizzes
**Delivers:** English support for test-avere, i18n infrastructure
**Addresses:** Multilingual differentiator
**Implements:** Language-aware JSON loading

Key tasks:
- Write test-avere-en.json
- Integrate with existing language switcher
- Test language fallback (missing translation falls back to Italian)

### Phase 4: Remaining Quizzes
**Rationale:** With architecture proven, replicate for other quizzes
**Delivers:** test-convertire and test-rinnovare in both languages
**Uses:** Established patterns from phases 1-3

Key tasks:
- Write test-convertire-it.json and test-convertire-en.json
- Write test-rinnovare-it.json and test-rinnovare-en.json
- Create test-convertire.html and test-rinnovare.html
- Map results to appropriate permit pages

### Phase 5: Integration
**Rationale:** Quizzes work; now integrate with main site
**Delivers:** Updated navigation, removed Typeform links

Key tasks:
- Update index.html test section with internal links
- Update nav dropdown across all pages
- Update sitemap.xml
- Update content-it.json and content-en.json test URLs
- Remove/archive Typeform references

### Phase Ordering Rationale

- **Foundation before polish:** Core engine must work before UX enhancements make sense
- **Single quiz before replication:** Prove architecture with test-avere; replicate pattern for others
- **i18n before quiz multiplication:** Better to establish translation pattern with 1 quiz than retrofit 3
- **Integration last:** Only update site navigation when all quizzes are ready

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Quiz branching logic implementation details — may need to validate JSON schema against actual Typeform quiz content
- **Phase 2:** iOS Safari testing — need actual device, simulators may miss zoom issues

Phases with standard patterns (skip research-phase):
- **Phase 3:** i18n — follows established content-{lang}.json pattern
- **Phase 4:** Quiz content — straightforward replication
- **Phase 5:** Integration — updating links across pages

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Vanilla JS + JSON is proven pattern; matches existing codebase |
| Features | HIGH | Feature list derived from Typeform limitations + wizard UX best practices |
| Architecture | HIGH | File structure mirrors existing conventions; JSON schema well-documented |
| Pitfalls | MEDIUM-HIGH | Web-verified against NN/g, CSS-Tricks, Smashing Magazine; some domain-specific |

**Overall confidence:** HIGH

This is a well-scoped project with established patterns. The main risk is organizational (scope creep) not technical.

### Gaps to Address

- **Actual Typeform quiz content:** Need to map existing Typeform questions to JSON schema — user or team must provide current quiz logic
- **Permit page completeness:** Results link to permit pages; ensure target pages exist (check TODO-permits.md)
- **Accessibility testing:** Patterns known but implementation should be verified with screen reader testing

## Sources

### Primary (HIGH confidence)
- [SurveyJS Architecture](https://surveyjs.io/documentation/surveyjs-architecture) — separation of concerns pattern
- [CSS-Tricks iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/) — 16px font requirement
- [NN/g Wizard Design](https://www.nngroup.com/articles/wizards/) — step-by-step UX best practices
- [W3C WAI Form Accessibility](https://www.w3.org/WAI/test-evaluate/preliminary/) — accessibility checklist

### Secondary (MEDIUM confidence)
- [Interact Help Center Branching Logic](https://help.tryinteract.com/en/articles/1193999-branching-logic-for-quizzes) — quiz-specific branching patterns
- [UXmatters Designing Calm](https://www.uxmatters.com/mt/archives/2025/05/designing-calm-ux-principles-for-reducing-users-anxiety.php) — anxiety-reducing UX
- [Topflight Apps Scope Creep](https://topflightapps.com/ideas/avoid-scope-creep/) — MVP scope management

### Tertiary (LOW confidence)
- [question-tree-core npm](https://www.npmjs.com/package/question-tree-core) — decision tree patterns (not used, but informed JSON schema)

---
*Research completed: 2026-01-31*
*Ready for roadmap: yes*
