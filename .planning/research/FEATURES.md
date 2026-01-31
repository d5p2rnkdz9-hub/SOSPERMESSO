# Feature Landscape: Proprietary Test System

**Domain:** Permit eligibility checker / decision-tree quiz
**Researched:** 2026-01-31
**Context:** Replacing 3 Typeform tests for SOS Permesso

## Table Stakes

Features users expect. Missing = test feels incomplete or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Step-by-step wizard flow** | Users expect one question at a time for decision trees; reduces cognitive load | Medium | Core architecture decision - proven to reduce overwhelm for anxious users |
| **Progress indicator** | Users need to know where they are and how much is left | Low | Use step counter (1/5) or progress bar; avoid more than 6 steps |
| **Back button** | Users expect to review/change previous answers | Low | Essential for confidence; anxious users fear irreversible mistakes |
| **Clear question text** | Bureaucracy is confusing; questions must be crystal clear | Low | Avoid jargon; use simple Italian/English |
| **Mobile responsiveness** | 60%+ of users will access on mobile | Medium | Already have mobile CSS system; apply to test UI |
| **Result display** | User needs a clear answer at the end | Low | Clear YES/NO/MAYBE with explanation |
| **Branching logic** | Different answers lead to different paths | Medium | Core feature - whole point of eligibility checker |
| **Loading states** | Users need feedback that something is happening | Low | Especially between steps if any server processing |
| **Error prevention** | Must not allow invalid states | Low | Disable "next" until answer selected; validate inputs |

### UX for Stressed Users (Table Stakes)

Immigration bureaucracy is stressful. These are not "nice to have" - they're essential for this audience.

| Feature | Why Essential for This Audience | Complexity |
|---------|--------------------------------|------------|
| **Calming visual design** | Reduce anxiety; avoid high-contrast colors, jarring animations | Low |
| **Reassuring language** | "Let's find out together" not "SUBMIT YOUR ANSWERS" | Low |
| **No time limits** | Time pressure triggers anxiety; WCAG 2.1 recommends avoiding timers | Low |
| **Undo capability** | Fear of irreversible mistakes is high; let users go back | Low |
| **Confirmation before submit** | WCAG 2.1 requires review before final submission | Low |
| **Gentle error messages** | "Let's try that again" not "ERROR: INVALID INPUT" | Low |
| **Clear explanations** | Explain WHY a question matters when not obvious | Low |

## Differentiators

Features that set the test apart from Typeform. Competitive advantages for SOS Permesso.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multilingual from day one** | Typeform tests are IT-only; EN support opens huge audience | Medium | Use i18n JSON approach like rest of site |
| **No response limits** | Typeform limits responses (10/month free, 100 at $25/month) | N/A | Self-hosted = unlimited |
| **No branding** | Typeform shows their branding unless $50+/month | Low | Own design system = SOS Permesso branding |
| **Save progress locally** | Users can pause and return later | Medium | localStorage approach; no login required |
| **Print/PDF results** | Users can keep record of their result | Medium | Helpful for showing to lawyers, family |
| **Direct links to permit pages** | Result links directly to relevant permit page | Low | Typeform can't do this intelligently |
| **Contextual help tooltips** | Explain terms inline without leaving flow | Low | Typeform requires external links |
| **Accessible by default** | Full keyboard navigation, screen reader support | Medium | WCAG 2.1 AA compliance |
| **Offline-capable** | Works without internet once loaded | High | PWA approach; helpful for users with poor connectivity |
| **Visual answer cards** | Picture-based answers for complex concepts | Medium | Easier than reading for non-native speakers |
| **Result explanation** | Not just "yes/no" but WHY and WHAT NEXT | Low | Crucial for actually helping users |

### Multilingual Considerations (Differentiator Detail)

| Consideration | Implementation | Complexity |
|--------------|----------------|------------|
| **Externalize all strings** | JSON files per language (content-it.json, content-en.json) | Low |
| **No string concatenation** | Full sentences, not pieced together | Low |
| **Variable placeholders** | "You may be eligible for {permitType}" not hardcoded | Low |
| **RTL support** | Not needed for IT/EN/FR/ES/ZH (all LTR) | N/A |
| **Cultural date formats** | If dates needed, use locale-aware formatting | Low |
| **Test with actual users** | Non-native speakers should validate clarity | N/A |

## Anti-Features

Features to explicitly NOT build. Common mistakes in quiz/test systems that would hurt SOS Permesso.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User accounts/login** | Adds friction; users just want quick answer | localStorage for save/resume, no auth |
| **Email capture before results** | Feels manipulative; reduces trust | Show results first, offer optional newsletter after |
| **Timer/countdown** | Increases anxiety; no benefit for eligibility checker | Let users take their time |
| **Gamification (points, badges)** | Trivializes serious immigration concerns | Keep tone helpful and professional |
| **Complex scoring system** | Not a quiz with grades; binary eligibility check | Simple decision tree to YES/NO/MAYBE |
| **Social sharing** | Immigration status is private; users won't share publicly | Offer print/PDF instead |
| **Mandatory phone number** | Privacy concern; unnecessary for this use case | Contact form exists elsewhere on site |
| **Analytics tracking of individual answers** | Privacy concern; could feel surveilled | Aggregate only if needed |
| **Auto-advance on answer** | Can cause accidental progression; reduces control | Require explicit "Next" click |
| **Confetti/celebration animations** | A permit eligibility result is not a game win | Calm, reassuring success state |
| **Video instructions** | Adds loading time, accessibility issues | Text with optional help tooltips |
| **Chat bot integration** | Scope creep; tests are self-contained | Keep tests simple, link to contact form |
| **Multiple result types** | Typeform "personality quiz" pattern; not applicable | Single clear outcome per path |

## Feature Dependencies

```
Core Architecture
    |
    +-- Branching Logic Engine
    |       |
    |       +-- Question Flow Controller
    |       +-- State Management
    |
    +-- UI Components
    |       |
    |       +-- Question Card
    |       +-- Answer Options
    |       +-- Progress Indicator
    |       +-- Navigation Buttons
    |       +-- Result Display
    |
    +-- i18n System
    |       |
    |       +-- String Externalization
    |       +-- Language Switcher Integration
    |
    +-- Persistence (optional)
            |
            +-- localStorage Save/Resume
            +-- Print/PDF Export
```

**Build order implications:**
1. Core branching logic must come first
2. UI components can be built in parallel with logic
3. i18n can be added after core flow works in Italian
4. Persistence features are optional enhancements

## MVP Recommendation

For MVP, prioritize:

### Phase 1: Core Test Engine
1. Step-by-step wizard flow with one question per screen
2. Branching logic for decision tree
3. Progress indicator (step counter)
4. Back/Next navigation
5. Clear result display with links to permit pages
6. Mobile-responsive design (use existing CSS)
7. Italian language first

### Phase 2: Accessibility & UX Polish
1. Full keyboard navigation
2. Screen reader support (ARIA labels)
3. Calming visual design refinements
4. Contextual help tooltips
5. Review/confirm before result

### Phase 3: Multilingual
1. i18n JSON structure for all strings
2. English translation
3. Language switcher integration

### Defer to Post-MVP
- Save/resume progress (localStorage)
- Print/PDF export
- Offline capability (PWA)
- Visual answer cards with images
- Additional languages (FR, ES, ZH)

## Typeform Limitations Addressed

| Typeform Problem | Our Solution |
|-----------------|--------------|
| 10-100 response limit per month | Self-hosted = unlimited |
| Typeform branding unless $50/month | Our branding |
| Logic Jumps limited to 3 on cheap plan | Unlimited branching |
| Can't share actual score, only ending | Full result display with context |
| No offline mode | Potential PWA support |
| Italian only (no i18n) | Multilingual architecture |
| Complex setup for decision trees | Purpose-built for permit checks |
| External dependency | Self-hosted, no vendor lock-in |
| Loading performance | Static, fast |
| Limited export options | Direct page links, print/PDF |

## Accessibility Requirements

For a government-adjacent information service, accessibility is both ethical and practical.

| Requirement | Level | Notes |
|-------------|-------|-------|
| Keyboard navigation | WCAG AA | Tab through all interactive elements |
| Screen reader support | WCAG AA | Proper ARIA labels, roles |
| Color contrast | WCAG AA | 4.5:1 minimum ratio |
| Focus indicators | WCAG AA | Visible focus states |
| Error identification | WCAG AA | Clear, non-color-only error states |
| Consistent navigation | WCAG AA | Predictable back/next behavior |
| No time limits | WCAG AA | Recommended for forms |
| Review before submit | WCAG AA | Success Criterion 3.3.4 |

## Sources

### Wizard/Form UX
- [Wizards: Definition and Design Recommendations - NN/G](https://www.nngroup.com/articles/wizards/)
- [Wizard UI Pattern: When to Use It - Eleken](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained)
- [How to Design a Form Wizard - Andrew Coyle](https://www.andrewcoyle.com/blog/how-to-design-a-form-wizard)
- [Step indicator - U.S. Web Design System](https://designsystem.digital.gov/components/step-indicator/)
- [Wizard Design Pattern - UX Planet](https://uxplanet.org/wizard-design-pattern-8c86e14f2a38)

### Anxiety-Reducing UX
- [Designing Calm: UX Principles for Reducing Users' Anxiety - UXmatters](https://www.uxmatters.com/mt/archives/2025/05/designing-calm-ux-principles-for-reducing-users-anxiety.php)
- [Accessibility for people with anxiety - TPGi](https://www.tpgi.com/a-web-of-anxiety-accessibility-for-people-with-anxiety-and-panic-disorders-part-2/)
- [Designing for Users with Anxiety - Medium](https://medium.com/@y2kanthale/designing-for-users-with-anxiety-a-guide-for-ux-designers-fb625fa38d95)

### Typeform Analysis
- [Best Typeform Alternatives - Tally](https://tally.so/help/best-alternatives-to-typeform-comparison-2025)
- [Typeform Pricing - Growform](https://www.growform.co/typeform-pricing/)
- [What is the Best Typeform Alternative - involve.me](https://www.involve.me/blog/best-typeform-alternative)

### Visa/Eligibility Checker Examples
- [U.S. State Department Visa Wizard](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/wizard.html)
- [Atlys Visa Eligibility Quiz](https://www.atlys.com/tools/visa-eligibility-quiz)

### i18n Best Practices
- [Internationalization Testing - Aqua Cloud](https://aqua-cloud.io/internationalization-testing/)
- [i18n Best Practices for Front-End - Shopify Engineering](https://shopify.engineering/internationalization-i18n-best-practices-front-end-developers)

### Accessibility Requirements
- [ADA Web Accessibility Rule 2024 - ADA.gov](https://www.ada.gov/resources/2024-03-08-web-rule/)
- [WCAG & ADA Website Compliance 2026 - Accessibility.works](https://www.accessibility.works/blog/wcag-ada-website-compliance-standards-requirements/)

---
*Researched for v2.0 milestone: Proprietary Test System*
