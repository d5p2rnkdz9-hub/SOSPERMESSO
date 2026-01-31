# Domain Pitfalls: Proprietary Quiz/Test System

**Domain:** Static HTML/CSS/JS quiz system for stressed immigrant users
**Researched:** 2026-01-31
**Confidence:** MEDIUM-HIGH (WebSearch verified against multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues. Address these in early phases.

---

### Pitfall 1: Scope Creep — Building Typeform Instead of 3 Tests

**What goes wrong:** The team starts adding "just one more feature" until the project becomes a generic quiz builder instead of 3 specific decision trees. Common additions that explode scope: analytics dashboards, A/B testing, drag-and-drop builder UI, custom scoring algorithms, email integrations.

**Why it happens:** Typeform does so much that teams feel they need feature parity. Also, developers enjoy building flexible systems more than constrained ones.

**Consequences:**
- 3-month project becomes 9-month project
- Over-engineered code that's hard to maintain
- Features nobody uses
- Delayed launch means users stuck on Typeform longer

**Prevention:**
- **Define "done" upfront:** 3 working tests, in 2 languages, with results. Nothing else.
- **MoSCoW prioritization:** Must-Have = the 3 tests work. Should-Have = progress indicators. Could-Have = share results. Won't-Have = analytics, builder UI, custom themes.
- **Scope lock:** Any new feature request goes to "v3.0 backlog" — not this milestone.
- **Time-box:** Set a hard deadline. If a feature doesn't fit, cut it.

**Detection (warning signs):**
- Discussions about "what if someone wants to add a new test?"
- Design for "reusable quiz components" before a single test works
- Phrases like "while we're at it" or "it would be easy to also..."
- Designing admin UI before user-facing UI

**Phase to address:** Phase 1 (Planning) — Lock scope before any code.

**Sources:** [Topflight Apps on MVP Scope Creep](https://topflightapps.com/ideas/avoid-scope-creep/), [Imaginovation on MVP Development](https://imaginovation.net/blog/prevent-scope-creep-mvp-development/)

---

### Pitfall 2: Confusing Branching Logic UX

**What goes wrong:** Users get lost in the decision tree. They don't know where they are, can't go back, or end up at a result that doesn't make sense for their answers.

**Why it happens:** Developers think in tree structures; users think in journeys. The branching makes perfect sense in code but confuses users who can't see the full tree.

**Consequences:**
- Users abandon mid-test
- Users get wrong results and lose trust
- Support requests asking "why did I get this result?"
- Users retry multiple times, wasting time

**Prevention:**
- **Clear feedback at every step:** Show current question number and total (e.g., "Question 2 of 5")
- **Allow back navigation:** Users must be able to return to previous questions
- **Show answer summary at the end:** Before showing results, recap what the user answered
- **Validate logic with real users:** Test with actual immigrants, not just developers
- **Limit branching depth:** Maximum 5-7 questions per path

**Detection (warning signs):**
- Users asking "what did I answer for question 2?"
- High drop-off rates mid-quiz
- Users restarting the test multiple times
- Results that don't match user expectations

**Phase to address:** Phase 2 (UX Design) — Create decision tree diagrams and test with users before coding.

**Sources:** [Interact Help Center on Branching Logic](https://help.tryinteract.com/en/articles/1193999-branching-logic-for-quizzes), [Thoughtbot on Decision Tree UX](https://thoughtbot.com/blog/building-and-testing-decision-tree)

---

### Pitfall 3: Mobile UX Disasters (iOS Zoom, Touch Targets)

**What goes wrong:** On iOS Safari, focusing on input fields with font-size < 16px triggers auto-zoom, which breaks the layout and doesn't zoom back out. Users get stuck in a zoomed, broken view.

**Why it happens:** Developers test on desktop or Android. iOS has this specific behavior that's easy to miss.

**Consequences:**
- Quiz becomes unusable on iPhone (a significant portion of immigrant users)
- Users see half the screen, can't navigate
- Frustration leads to abandonment
- Users think the site is broken

**Prevention:**
- **Use 16px minimum font-size** for all form inputs and textareas
- **Test on actual iOS devices** — simulators don't always replicate this
- **Touch targets minimum 44x44px** — Apple's HIG requirement
- **Avoid maximum-scale=1** in viewport (breaks accessibility for vision-impaired users)
- **Use CSS `max()` for fonts:** `font-size: max(16px, 1rem)` honors user preferences while preventing zoom

**Detection (warning signs):**
- Any input or textarea with font-size less than 16px
- Testing only on desktop browsers
- Complaints about "zoomed in" or "can't see the whole screen"

**Phase to address:** Phase 3 (Implementation) — Set up CSS variables for input sizing from day 1.

**Sources:** [CSS-Tricks on iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/), [Rick Strahl's Blog on iOS Safari Zooming](https://weblog.west-wind.com/posts/2023/Apr/17/Preventing-iOS-Textbox-Auto-Zooming-and-ViewPort-Sizing)

---

### Pitfall 4: Error Messages That Increase Anxiety

**What goes wrong:** Users (already stressed about bureaucracy) encounter vague, harsh, or confusing error messages. "Invalid input" or "Required field" without guidance. Red error colors without explanation.

**Why it happens:** Developers write error messages for debugging, not for anxious users who may not read Italian fluently.

**Consequences:**
- Users abandon the test, thinking they did something wrong
- Users avoid answering honestly for fear of "wrong answers"
- Increased cognitive load on already stressed users
- Perception that the site is unfriendly

**Prevention:**
- **No validation errors until submission** — don't interrupt typing
- **Inline validation after blur** — validate when user leaves a field, not during typing
- **Friendly, specific messages:** "Please select an option to continue" not "Error: required"
- **No "wrong answer" framing** — tests guide to results, not pass/fail
- **Position errors above the field** (visible on mobile with keyboard open)
- **Use icons + color** — don't rely on color alone (colorblind users)

**Detection (warning signs):**
- Technical error messages ("null", "undefined", error codes)
- Red-only indicators without text explanation
- Premature validation (errors appear while typing)
- Generic messages ("Invalid", "Error", "Required")

**Phase to address:** Phase 2 (UX Design) — Design error states and copy before implementation.

**Sources:** [NN/g on Form Error Design](https://www.nngroup.com/articles/errors-forms-design-guidelines/), [Smashing Magazine on Error Messages UX](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/)

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

---

### Pitfall 5: localStorage Misuse for State Management

**What goes wrong:** Storing complex quiz state in localStorage without proper serialization. Objects become "[object Object]". State gets corrupted or lost. No fallback for private browsing.

**Why it happens:** localStorage seems simple but only stores strings. Developers forget JSON.stringify/parse, or don't handle edge cases.

**Prevention:**
- **Always use JSON.stringify/parse** for any non-string data
- **Handle private browsing mode** — Safari throws errors when localStorage is full or in private mode
- **Use sessionStorage for quiz progress** — clears on tab close, no stale state
- **Provide state reset option** — "Start Over" button that clears all quiz state
- **Store minimal state** — current question index and answers array, not full quiz objects

**Detection (warning signs):**
- "[object Object]" appearing in console or storage
- Quiz state persisting unexpectedly across sessions
- Errors in Safari private browsing
- Complex objects stored directly without serialization

**Phase to address:** Phase 3 (Implementation) — Establish state management pattern early.

**Sources:** [Smashing Magazine on localStorage](https://www.smashingmagazine.com/2010/10/local-storage-and-how-to-use-it/)

---

### Pitfall 6: Missing Progress Indicators

**What goes wrong:** Users don't know how long the quiz is. They abandon halfway through, not knowing they were 80% done.

**Why it happens:** Progress indicators seem like a nice-to-have, not essential. Branching logic makes progress calculation tricky.

**Prevention:**
- **Show progress from question 1** — "Question 1 of 5-7" (range for branching)
- **Fast-to-slow progress feels better** — start with easy questions that feel quick
- **Progress should feel encouraging** — don't show 5% after 3 questions
- **For branching:** show current/maximum or approximate ("about 5 questions left")

**Detection (warning signs):**
- No visual progress indicator in designs
- Users asking "how many more questions?"
- High drop-off in the middle of quizzes

**Phase to address:** Phase 2 (UX Design) — Include progress indicator in wireframes.

**Sources:** [Zuko on Progress Bars](https://www.zuko.io/blog/progress-bars-in-online-forms), [Revenue Hunt on Drop-off](https://docs.revenuehunt.com/customer-success/reduce-dropoff/)

---

### Pitfall 7: Hardcoded Italian Text

**What goes wrong:** All quiz text is hardcoded in HTML/JS. When adding English version, every string must be found and duplicated. Maintenance becomes a nightmare.

**Why it happens:** "We'll add translations later" — but the architecture doesn't support it. Single-language MVP becomes legacy.

**Prevention:**
- **i18n from day 1** — even if only Italian at first
- **All user-facing text in JSON files** — `content-it.json`, `content-en.json`
- **Establish translation keys** — `quiz.question1.text`, `quiz.result.positive`
- **No string concatenation** — use template placeholders for dynamic content
- **Test with long strings** — German/English often 30% longer than Italian

**Detection (warning signs):**
- User-facing strings directly in HTML or JS
- Template literals that concatenate translated + untranslated text
- "We'll internationalize it later" in planning documents

**Phase to address:** Phase 1 (Planning) — Define content structure before implementation.

**Sources:** [Phrase on i18n Challenges](https://phrase.com/blog/posts/internationalization-beyond-code-a-developers-guide-to-real-world-language-challenges/)

---

### Pitfall 8: Accessibility Afterthought

**What goes wrong:** Quiz works visually but is unusable with screen readers. Keyboard navigation traps users. Color contrast fails. Radio buttons unlabeled.

**Why it happens:** Accessibility testing requires extra tools and knowledge. "We'll fix it later" leads to structural issues.

**Prevention:**
- **Semantic HTML from the start** — `<fieldset>`, `<legend>`, `<label for="...">`
- **Keyboard navigation tested per phase** — Tab, Enter, Space, Arrow keys
- **ARIA labels on custom controls** — if not using native form elements
- **Color contrast: 4.5:1 minimum** — test all text/background combinations
- **Focus states visible** — users must see where they are

**Detection (warning signs):**
- Custom div-based "buttons" instead of real buttons
- Radio buttons without labels
- No visible focus indicators
- Color as only differentiator

**Phase to address:** Phase 3 (Implementation) — Use semantic HTML; test with keyboard.

**Sources:** [W3C WAI on Form Accessibility](https://www.w3.org/WAI/test-evaluate/preliminary/)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

---

### Pitfall 9: No "Start Over" Option

**What goes wrong:** User makes a mistake, wants to restart, but there's no clear way to do so except refreshing the page.

**Prevention:** Add "Ricomincia" / "Start Over" button visible throughout the quiz.

**Phase to address:** Phase 2 (UX Design)

---

### Pitfall 10: Results Not Shareable

**What goes wrong:** User wants to save or share their result, but it's only shown on-screen with no way to return to it.

**Prevention:** Generate a result page URL or offer "Print/Save as PDF" option.

**Phase to address:** Phase 3 (Implementation) — Could-Have feature, not Must-Have.

---

### Pitfall 11: No Analytics on Quiz Completion

**What goes wrong:** No visibility into how many users complete vs. abandon, which questions cause drop-off.

**Prevention:** Basic completion tracking (could be just console logging or simple counters for now). Full analytics is v3.0.

**Phase to address:** Phase 4 (Testing/Launch) — Simple tracking, defer dashboard.

---

## Phase-Specific Warnings

| Phase | Likely Pitfall | Mitigation |
|-------|---------------|------------|
| Phase 1: Planning | Scope creep (#1) | Lock scope with MoSCoW, time-box |
| Phase 2: UX Design | Confusing branching (#2), No progress (#6), Anxiety errors (#4) | Decision tree diagrams, user testing before code |
| Phase 3: Implementation | iOS zoom (#3), localStorage (#5), Hardcoded text (#7), Accessibility (#8) | 16px fonts, semantic HTML, i18n structure |
| Phase 4: Testing | Missing progress, No start-over (#9) | Test with real users on mobile iOS |
| Phase 5: Launch | No analytics (#11) | Basic tracking only |

---

## Sources

**Scope & MVP:**
- [Topflight Apps - How to Avoid Scope Creep](https://topflightapps.com/ideas/avoid-scope-creep/)
- [Imaginovation - Prevent Scope Creep MVP](https://imaginovation.net/blog/prevent-scope-creep-mvp-development/)
- [Digiblankcanvas - What MVP Really Means](https://digiblankcanvas.com/blog/what-mvp-really-means-and-how-to-avoid-overbuilding/)

**Branching Logic & Navigation:**
- [Interact Help Center - Branching Logic for Quizzes](https://help.tryinteract.com/en/articles/1193999-branching-logic-for-quizzes)
- [Thoughtbot - Building Decision Tree UX](https://thoughtbot.com/blog/building-and-testing-decision-tree)

**Mobile & iOS:**
- [CSS-Tricks - 16px Text Prevents iOS Form Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/)
- [Rick Strahl - Preventing iOS Textbox Zooming](https://weblog.west-wind.com/posts/2023/Apr/17/Preventing-iOS-Textbox-Auto-Zooming-and-ViewPort-Sizing)

**Error Messages & Forms:**
- [NN/g - 10 Guidelines for Error Messages](https://www.nngroup.com/articles/errors-forms-design-guidelines/)
- [Smashing Magazine - Error Messages UX Design](https://www.smashingmagazine.com/2022/08/error-messages-ux-design/)

**Progress & Drop-off:**
- [Zuko - Progress Bars in Online Forms](https://www.zuko.io/blog/progress-bars-in-online-forms)
- [Revenue Hunt - Reduce Drop-off](https://docs.revenuehunt.com/customer-success/reduce-dropoff/)

**State Management:**
- [Smashing Magazine - localStorage](https://www.smashingmagazine.com/2010/10/local-storage-and-how-to-use-it/)

**Accessibility:**
- [W3C WAI - Easy Checks for Accessibility](https://www.w3.org/WAI/test-evaluate/preliminary/)

**i18n:**
- [Phrase - Internationalization Challenges](https://phrase.com/blog/posts/internationalization-beyond-code-a-developers-guide-to-real-world-language-challenges/)

---

*Last updated: 2026-01-31*
