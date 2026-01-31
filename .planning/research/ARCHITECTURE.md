# Architecture Patterns for Static-Site Quiz System

**Domain:** Quiz/Test integration with existing static HTML site
**Researched:** 2026-01-31
**Confidence:** HIGH

## Executive Summary

The quiz system integrates as a **client-side JavaScript module** that loads quiz definitions from JSON files and renders them into existing HTML page templates. The architecture follows the project's established patterns: static HTML pages, CSS from the design system, and vanilla JavaScript for interactivity. No build-time quiz generation is needed because quiz logic executes entirely at runtime.

## Recommended Architecture

```
                    +-------------------+
                    |   User visits     |
                    | /src/pages/test-  |
                    |   avere.html      |
                    +--------+----------+
                             |
                             v
+----------------+   +-------+--------+   +------------------+
|  quiz.js       |<--| HTML Template  |-->| quiz.css         |
| (quiz engine)  |   | (page shell)   |   | (quiz styles)    |
+-------+--------+   +----------------+   +------------------+
        |
        | fetch()
        v
+-------+--------+
| quiz-avere-    |
| {lang}.json    |
| (quiz data)    |
+-------+--------+
        |
        | Branching logic
        v
+-------+--------+
| Result page    |<---- Links to permit pages
| (inline)       |      in /src/pages/permesso-*.html
+----------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `quiz.js` | Quiz engine: state machine, navigation, rendering | HTML template, JSON data, localStorage |
| `quiz-*.json` | Quiz definitions: questions, options, branching rules, results | Loaded by quiz.js |
| `test-*.html` | Page shell: header, footer, container for quiz | Links to quiz.js, quiz.css |
| `quiz.css` | Quiz-specific styles extending design system | Imports CSS variables from main.css |
| localStorage | State persistence: current question, answer history | Read/written by quiz.js |

## Where Test Files Should Live

### Recommended File Structure

```
src/
  data/
    quizzes/
      test-avere-it.json       # Italian: "Posso AVERE un permesso?"
      test-avere-en.json       # English: "Can I GET a permit?"
      test-convertire-it.json  # Italian: "Posso CONVERTIRE?"
      test-convertire-en.json  # English: "Can I CONVERT?"
      test-rinnovare-it.json   # Italian: "Posso RINNOVARE?"
      test-rinnovare-en.json   # English: "Can I RENEW?"
  pages/
    test-avere.html            # Quiz page (loads correct JSON by lang)
    test-convertire.html
    test-rinnovare.html
  scripts/
    quiz.js                    # Single quiz engine module
  styles/
    quiz.css                   # Quiz-specific styles
```

### Why This Structure

1. **Mirrors existing patterns**: `src/data/content-*.json` already exists for multilingual content
2. **Clear separation**: Data (JSON) separate from presentation (HTML) and logic (JS)
3. **Scalable**: Adding Quiz 4 means adding `test-nuovo-{lang}.json` + `test-nuovo.html`
4. **Git-friendly**: Quiz content versioned alongside code
5. **No build step**: Files served directly by Netlify

### Alternative Considered: Separate `/tests/` Directory

```
tests/                    # NOT RECOMMENDED
  avere/
    index.html
    data-it.json
    data-en.json
```

**Why rejected**: Breaks existing `src/pages/` convention. Users expect all pages under one directory. Would require Netlify redirect config changes.

## How Test Data Should Be Structured

### Quiz JSON Schema

```json
{
  "meta": {
    "id": "test-avere",
    "version": "1.0",
    "lang": "it",
    "title": "Posso AVERE un permesso?",
    "description": "Verifica se hai i requisiti per ottenere un permesso di soggiorno"
  },
  "start": "q1",
  "questions": {
    "q1": {
      "id": "q1",
      "text": "Hai un visto d'ingresso valido per l'Italia?",
      "helpText": "Il visto deve essere stato rilasciato per il motivo per cui chiedi il permesso",
      "type": "single",
      "options": [
        {
          "id": "yes",
          "text": "Si, ho un visto valido",
          "next": "q2"
        },
        {
          "id": "no",
          "text": "No, non ho un visto",
          "next": "result-no-visa"
        },
        {
          "id": "expired",
          "text": "Ho un visto scaduto",
          "next": "result-expired-visa"
        }
      ]
    },
    "q2": {
      "id": "q2",
      "text": "Per quale motivo hai ottenuto il visto?",
      "type": "single",
      "options": [
        { "id": "work", "text": "Lavoro subordinato", "next": "q3-work" },
        { "id": "study", "text": "Studio", "next": "q3-study" },
        { "id": "family", "text": "Ricongiungimento familiare", "next": "result-family" },
        { "id": "other", "text": "Altro motivo", "next": "q3-other" }
      ]
    }
  },
  "results": {
    "result-no-visa": {
      "id": "result-no-visa",
      "type": "negative",
      "title": "Non puoi richiedere un permesso di soggiorno",
      "description": "Per richiedere un permesso di soggiorno serve un visto d'ingresso valido. Ci sono alcune eccezioni, ma nella maggior parte dei casi il visto e' necessario.",
      "nextSteps": [
        "Verifica se rientri in una delle eccezioni",
        "Contatta un legale per assistenza"
      ],
      "links": [
        {
          "text": "Scopri le eccezioni",
          "url": "protezione-internazionale.html",
          "type": "internal"
        },
        {
          "text": "Trova assistenza legale",
          "url": "aiuto-legale.html",
          "type": "internal"
        }
      ]
    },
    "result-work-permit": {
      "id": "result-work-permit",
      "type": "positive",
      "title": "Puoi richiedere un permesso per lavoro subordinato",
      "description": "Hai i requisiti per richiedere un permesso di soggiorno per lavoro subordinato.",
      "permitType": "lavoro-subordinato",
      "links": [
        {
          "text": "Vai alla pagina del permesso",
          "url": "permesso-lavoro-subordinato.html",
          "type": "internal",
          "primary": true
        },
        {
          "text": "Documenti necessari",
          "url": "documenti-lavoro-subordinato-art-5-primo.html",
          "type": "internal"
        }
      ]
    }
  }
}
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Question IDs as keys** | O(1) lookup for navigation; easy to reference in branching |
| **`next` property on options** | Explicit branching - each answer points to next question or result |
| **Results separate from questions** | Clear distinction between quiz flow and outcomes |
| **`type` on results** | Enables styling (positive=green, negative=red, neutral=yellow) |
| **`links` with `type: internal`** | Quiz engine can resolve relative URLs to permit pages |
| **`permitType` on results** | Machine-readable link to database for future features |
| **`helpText` optional** | Expandable hints without cluttering main question |

### Branching Logic Model

The quiz uses a **directed graph** where:
- Nodes are questions or results
- Edges are answer options with `next` pointers

```
[q1: Hai un visto?]
    |-- yes --> [q2: Che tipo?]
    |               |-- work --> [q3-work] --> [result-work]
    |               |-- study --> [q3-study] --> [result-study]
    |               |-- family --> [result-family]
    |-- no --> [result-no-visa]
    |-- expired --> [result-expired-visa]
```

This is simpler than a state machine library (XState) because:
1. No parallel states needed
2. No guards/conditions beyond answer selection
3. No entry/exit actions
4. Linear progression with branching

## How Results Connect to Existing Pages

### Link Resolution Strategy

Results contain `links` arrays with relative URLs that point to existing permit and document pages:

```json
"links": [
  {
    "text": "Vai alla pagina del permesso",
    "url": "permesso-lavoro-subordinato.html",
    "type": "internal",
    "primary": true
  }
]
```

The quiz engine resolves these URLs relative to the quiz page location:
- Quiz at `/src/pages/test-avere.html`
- Link URL: `permesso-lavoro-subordinato.html`
- Resolved: `/src/pages/permesso-lavoro-subordinato.html`

### Result-to-Permit Mapping

| Result Type | Links To | Purpose |
|-------------|----------|---------|
| Positive (can apply) | `permesso-{type}.html` | Learn about the permit |
| Positive (can apply) | `documenti-{type}-primo.html` | Checklist for first application |
| Negative (cannot apply) | `aiuto-legale.html` | Find legal assistance |
| Conditional (maybe) | Multiple permit pages | Compare options |
| Redirect (wrong test) | `test-{other}.html` | Suggest correct quiz |

### Visual Integration

Results render using existing card and alert components:

```html
<!-- Positive result -->
<div class="card card-success">
  <h2 class="card-title">Puoi richiedere un permesso!</h2>
  <p class="card-description">...</p>
  <div class="result-links">
    <a href="permesso-lavoro-subordinato.html" class="btn btn-primary">
      Vai alla pagina del permesso
    </a>
    <a href="documenti-lavoro-subordinato-art-5-primo.html" class="btn btn-secondary">
      Documenti necessari
    </a>
  </div>
</div>

<!-- Negative result -->
<div class="alert alert-error">
  <h2>Non puoi richiedere un permesso</h2>
  <p>...</p>
  <a href="aiuto-legale.html" class="btn btn-secondary">Trova assistenza</a>
</div>
```

## Build-Time vs Runtime Considerations

### Why Runtime-Only (No Build Step)

| Consideration | Build-Time | Runtime | Recommendation |
|---------------|------------|---------|----------------|
| **Quiz logic** | Pre-render all paths as static HTML | JS interprets JSON | **Runtime** - Branching creates exponential paths |
| **Multilingual** | Generate 6 HTML files per quiz | One HTML, fetch correct JSON | **Runtime** - Matches existing lang switcher |
| **Updates** | Rebuild and redeploy | Update JSON only | **Runtime** - Faster iteration |
| **SEO** | Full content indexed | Only page shell indexed | **Runtime acceptable** - Quizzes are interactive tools, not content |
| **Performance** | Zero JS for quiz | ~5KB JS + JSON fetch | **Runtime acceptable** - Minimal overhead |

### What Happens at Runtime

1. User visits `test-avere.html`
2. Page loads header/footer, empty quiz container
3. `quiz.js` initializes:
   - Reads `sospermesso-lang` from localStorage (default: `it`)
   - Fetches `quizzes/test-avere-{lang}.json`
   - Renders first question
4. User answers questions:
   - quiz.js updates in-memory state
   - Renders next question based on `next` pointer
   - Saves progress to localStorage (optional)
5. User reaches result:
   - quiz.js renders result card with links
   - Links are relative URLs to permit pages

### What Could Be Build-Time (But Shouldn't Be)

| Task | Why NOT Build-Time |
|------|-------------------|
| Pre-render all quiz paths | 3 questions with 4 options each = 64 paths. Not practical. |
| Generate result pages | Results are contextual to the quiz flow, not standalone content |
| Validate JSON schema | Could add to build script, but not blocking |
| Combine JSON files | Would break translation workflow |

### Optional Build-Time Enhancements

If needed later, a build script could:
1. **Validate quiz JSON** against schema
2. **Check broken links** in result URLs
3. **Generate sitemap entries** for quiz pages
4. **Minify quiz.js** (currently unnecessary at ~200 lines)

## Patterns to Follow

### Pattern 1: State Machine for Quiz Flow

**What**: Track quiz state in a simple object, transition based on user answers.

**When**: Always - core quiz navigation pattern.

**Implementation**:

```javascript
const quizState = {
  quizId: 'test-avere',
  currentQuestion: 'q1',
  answers: [],      // History for back navigation
  startedAt: null,
  completedAt: null
};

function handleAnswer(optionId) {
  const question = quizData.questions[quizState.currentQuestion];
  const selectedOption = question.options.find(o => o.id === optionId);

  // Save answer for back navigation
  quizState.answers.push({
    questionId: quizState.currentQuestion,
    answerId: optionId
  });

  // Navigate to next question or result
  if (selectedOption.next.startsWith('result-')) {
    renderResult(selectedOption.next);
  } else {
    quizState.currentQuestion = selectedOption.next;
    renderQuestion(selectedOption.next);
  }
}
```

### Pattern 2: Language-Aware JSON Loading

**What**: Load quiz data based on user's language preference.

**When**: Always - enables multilingual quizzes.

**Implementation**:

```javascript
async function loadQuizData(quizId) {
  const lang = localStorage.getItem('sospermesso-lang') || 'it';
  const url = `../data/quizzes/${quizId}-${lang}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Fallback to Italian if translation missing
      const fallback = await fetch(`../data/quizzes/${quizId}-it.json`);
      return fallback.json();
    }
    return response.json();
  } catch (error) {
    console.error('Failed to load quiz:', error);
    showError('Quiz non disponibile');
  }
}
```

### Pattern 3: Progressive Enhancement

**What**: Quiz page works even if JS fails; shows message to enable JS.

**When**: Always - accessibility and robustness.

**Implementation**:

```html
<!-- In test-avere.html -->
<div id="quiz-container">
  <noscript>
    <div class="alert alert-warning">
      <p>Questo test richiede JavaScript.</p>
      <p>Abilita JavaScript nel browser o
         <a href="https://form.typeform.com/to/kt7P9Ejk">usa la versione Typeform</a>.</p>
    </div>
  </noscript>
  <div id="quiz-loading" class="quiz-loading">
    Caricamento...
  </div>
</div>
```

### Pattern 4: Back Navigation with History

**What**: Users can go back to previous questions.

**When**: Always - expected UX for multi-step forms.

**Implementation**:

```javascript
function handleBack() {
  if (quizState.answers.length === 0) return;

  const lastAnswer = quizState.answers.pop();
  quizState.currentQuestion = lastAnswer.questionId;
  renderQuestion(lastAnswer.questionId);
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoding Questions in HTML

**What**: Embedding quiz questions directly in HTML files.

**Why bad**:
- Duplicates content for each language
- Can't share quiz engine across tests
- Harder to update questions

**Instead**: Store questions in JSON, render with JS.

### Anti-Pattern 2: Using URL Parameters for State

**What**: `/test-avere.html?q=3&a=yes,work,family`

**Why bad**:
- URLs become unwieldy
- Browser history polluted with every answer
- Sharing URL reveals partial progress

**Instead**: Use in-memory state + optional localStorage.

### Anti-Pattern 3: Pre-rendering All Paths

**What**: Generating static HTML for every possible quiz path.

**Why bad**:
- Exponential growth: 3 questions x 4 options = 64 pages per quiz
- Must regenerate on any content change
- SEO irrelevant for interactive tools

**Instead**: Single HTML template + runtime JSON interpretation.

### Anti-Pattern 4: Mixing Quiz Logic with App.js

**What**: Adding quiz functions to existing `app.js`.

**Why bad**:
- Loads quiz code on every page
- Harder to maintain separation of concerns
- Quiz bugs could break site navigation

**Instead**: Separate `quiz.js` loaded only on test pages.

## Accessibility Considerations

| Requirement | Implementation |
|-------------|----------------|
| **Keyboard navigation** | Radio buttons for options, Tab/Enter to select |
| **Screen readers** | ARIA labels on questions, live regions for updates |
| **Focus management** | Focus first option when question changes |
| **Color independence** | Icons (checkmark/X) plus colors for results |
| **Reduced motion** | Check `prefers-reduced-motion` for transitions |

## Scalability Considerations

| Concern | At 3 Quizzes | At 10 Quizzes | At 50 Quizzes |
|---------|--------------|---------------|---------------|
| File count | 6 JSON + 3 HTML | 20 JSON + 10 HTML | 100 JSON + 50 HTML |
| Maintenance | Manual updates | Consider quiz builder | Need admin UI |
| Load time | Instant (~2KB/quiz) | Still fast | Lazy load quiz list |
| Translation | Manual JSON files | Translation memory | Professional i18n tool |

**Recommendation**: Current architecture handles up to 10-15 quizzes easily. Beyond that, consider:
- Quiz builder tool (Node.js CLI or web UI)
- Notion as quiz content source (like permits)
- Automated translation pipeline

## Integration Checklist

When implementing quizzes, update these files:

| File | Change Required |
|------|----------------|
| `index.html` | Update test section hrefs to internal pages |
| `index.html` | Update nav dropdown Test menu |
| `src/pages/*.html` | Update header nav template (all pages) |
| `src/data/content-it.json` | Update test URLs |
| `src/data/content-en.json` | Update test URLs |
| `sitemap.xml` | Add quiz page entries |

## Sources

- [question-tree GitHub](https://github.com/hansbrough/question-tree) - Decision tree architecture pattern with JSON graph
- [SurveyJS Architecture](https://surveyjs.io/documentation/surveyjs-architecture) - Separation of core logic from rendering
- [XState State Machines](https://stately.ai/docs/machines) - State machine concepts (simplified for this use case)
- [Interact Branching Logic](https://help.tryinteract.com/en/articles/1193999-branching-logic-for-quizzes) - Conditional quiz flow patterns
- [GETMARKED JSON Schema](https://digitaliser.getmarked.ai/docs/api/question_schema/) - Quiz question data modeling
- [Wizard-JS](https://github.com/AdrianVillamayor/Wizard-JS) - Vanilla JS multi-step form patterns
- [i18next JSON Format](https://www.i18next.com/misc/json-format) - Multilingual JSON structure patterns

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| File structure | HIGH | Follows existing project conventions |
| JSON schema | HIGH | Based on proven quiz data models |
| Runtime approach | HIGH | Standard pattern for interactive widgets |
| Result linking | HIGH | Uses existing page structure |
| Back navigation | HIGH | Standard multi-step form pattern |
| Accessibility | MEDIUM | Patterns known, implementation details to verify |
| Scalability beyond 10 quizzes | LOW | Would need re-evaluation |

---
*Research conducted 2026-01-31 for v2.0 milestone (proprietary test system)*
