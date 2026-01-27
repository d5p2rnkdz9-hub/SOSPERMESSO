# External Integrations

**Analysis Date:** 2026-01-25

## APIs & External Services

**Typeform (Embedded Forms):**
- Form Provider: Typeform
- Purpose: Qualification tests and contact form submission
- Type: Embedded iframe forms (no backend needed)

**Typeform URL Pattern:** `form.typeform.com/to/[form_id]`

**Test Forms:**
1. "Posso AVERE un permesso?" - https://form.typeform.com/to/kt7P9Ejk
   - Tests eligibility for residence permits
   - Located: `index.html` (home page), navigation dropdown
   - Also in: `src/data/content-it.json` and `src/data/content-en.json`

2. "Posso CONVERTIRE il mio permesso?" - https://form.typeform.com/to/oc9jhdkJ
   - Tests permit conversion options
   - Located: `index.html`

3. "Posso RINNOVARE il permesso?" - https://form.typeform.com/to/R7HY8nBp
   - Tests permit renewal eligibility
   - Located: `index.html` navigation dropdown, content JSON files

**Collabora Dropdown Forms:**
4. "Segnala un errore" - https://form.typeform.com/to/FsqvzdXI
   - Report errors or issues on the website
   - Located: Navigation Collabora dropdown (all pages)

5. "Dai una mano" (Contact) - https://form.typeform.com/to/USx16QN3
   - General contact and help form
   - Located: Navigation Collabora dropdown (all pages), index.html footer
   - Credentials: No SDK/API key needed (embedded form)

---

**Google Fonts CDN:**
- Provider: Google Fonts
- Purpose: Typography system
- Fonts loaded:
  - Inter: Weights 400, 500, 600, 700 (body text)
  - Poppins: Weights 600, 700, 800 (headings)
- URLs:
  - Preconnect: https://fonts.googleapis.com
  - DNS Prefetch: https://fonts.gstatic.com
  - Font CSS: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap
- Implementation: Linked in `<head>` of all pages (see `index.html`, `src/pages/*.html`)
- No authentication required (public CDN)

---

## Data Storage

**No Database:**
- Project is a static site with no backend database
- Content stored in JSON files (client-side only)

**File-based Content:**
- `src/data/content-it.json` - Italian content
- `src/data/content-en.json` - English content
- Loaded via fetch API from `src/scripts/app.js`
- No persistent data storage on server

**LocalStorage (Browser):**
- Usage: Store user's language preference
- Key: `sospermesso-lang`
- Values: 'it', 'en', 'fr', 'es', 'zh'
- Location: `src/scripts/app.js` (line 53, 67)

---

## Authentication & Identity

**No Authentication System:**
- Project is a public information site
- No user login or authentication required
- No user accounts or sessions

---

## Monitoring & Observability

**Analytics (Placeholder):**
- Framework: Custom `trackEvent()` function in `src/scripts/app.js`
- Current State: Console logging only (lines 226-234)
- Placeholder comment: Mentions Google Analytics integration possible
- Tracked Events:
  - CTA button clicks on Typeform links
  - Event data: button_text, destination URL
- Location: `src/scripts/app.js` (lines 226-248)

**No Error Tracking:**
- No Sentry, LogRocket, or similar integration
- Error handling present in fetch calls but not sent anywhere

**Logging:**
- Console logging only
- Basic error messages in try/catch blocks

---

## CI/CD & Deployment

**Hosting:**
- Not yet deployed
- Designed for static file hosting (Netlify, Vercel, GitHub Pages, traditional web server)
- No special server-side requirements

**CI Pipeline:**
- None detected
- No GitHub Actions, GitLab CI, or similar
- Repository tracked in git (`/Users/albertopasquero/Desktop/TECH/SOSpermesso/Sito_Nuovo/.git`)

---

## Environment Configuration

**Required Environment Variables:**
- None - Project is fully static with no backend

**Secrets Location:**
- No secrets in codebase
- No .env files
- All configurations are public (CSS variables, Typeform URLs)

---

## Webhooks & Callbacks

**Incoming Webhooks:**
- None detected
- No endpoint to receive webhooks

**Outgoing Webhooks:**
- Typeform submissions are handled by Typeform backend
- No custom webhook implementation

**Contact Form Backend:**
- Current Implementation: Simulated with 1500ms timeout in `src/components/contact-form.html` (line 504)
- Form data collected but not sent anywhere
- Comment (line 493-501): Shows two integration options:
  1. Send to Typeform webhook endpoint
  2. Send to custom backend API at `/api/contact` (commented out)
- **Next Step:** Backend integration required before production

---

## Form Integration Details

**Contact Form (`src/components/contact-form.html`):**
- Type: Modal form with backdrop blur
- Fields:
  - Name (required, text)
  - Email (required, email validation)
  - Subject (required, dropdown with 7 options)
  - Message (required, min 20 chars, textarea)
  - Privacy checkbox (required)
- Validation:
  - Built-in HTML validation
  - JavaScript: Checks message length >= 20 chars
  - Privacy acceptance required
- Submission:
  - Currently simulates success with setTimeout (1500ms)
  - Shows loading state (spinner)
  - Displays success/error messages
  - Auto-closes modal after 3 seconds on success
- How to integrate:
  - Replace setTimeout simulation with actual API call
  - See lines 493-504 for commented examples

---

## Data Flow for Forms

**Test Forms Flow:**
1. User clicks test button on home page
2. Browser navigates to Typeform URL (external)
3. Typeform handles form submission, storage, and responses

**Contact Form Flow (Current):**
1. User clicks "Contatti" button
2. Modal opens with form
3. User fills and submits form
4. JavaScript collects form data
5. Currently: Simulated success response
6. Future: Send to backend API or Typeform

---

## API Endpoints (Current & Planned)

**Current (None - Static Site):**
- All resources are static HTML, CSS, JS, JSON files

**Fetch Calls in Code:**
- `fetch(`../data/content-${lang}.json`)` in `src/scripts/app.js` (line 206)
  - Loads JSON content for current language
  - Used for dynamic content rendering

**Planned (Before Production):**
- `/api/contact` - POST endpoint for contact form submission
  - Required for contact form to work
  - Should accept: name, email, subject, message, privacy checkbox
  - Should send confirmation email and store submission

---

## Third-Party Service URLs

**Typeform Forms:**
- https://form.typeform.com/to/kt7P9Ejk (Test eligibility - "Posso AVERE")
- https://form.typeform.com/to/oc9jhdkJ (Test conversion - "Posso CONVERTIRE")
- https://form.typeform.com/to/R7HY8nBp (Test renewal - "Posso RINNOVARE")
- https://form.typeform.com/to/FsqvzdXI (Segnala un errore)
- https://form.typeform.com/to/USx16QN3 (Dai una mano / Contact)

**Google Fonts:**
- https://fonts.googleapis.com (Font CSS delivery)
- https://fonts.gstatic.com (Font file hosting)

---

## Security Considerations

**No Sensitive Data:**
- No user authentication tokens
- No payment processing
- No personal data collection (contact form only collects email, name, message)
- No API keys in frontend code

**CORS:**
- Google Fonts: Open CORS (public CDN)
- Typeform: Cross-origin requests allowed

**HTTPS:**
- Required for production deployment
- Contact form should only submit over HTTPS
- Google Fonts automatically served over HTTPS

---

*Integration audit: 2026-01-25*
