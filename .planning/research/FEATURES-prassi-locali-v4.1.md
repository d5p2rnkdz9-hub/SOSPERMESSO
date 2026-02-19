# Feature Landscape: Prassi Locali Community Submission + Voting System

**Domain:** Community UGC submission with moderation — anonymous, small-scale, admin-moderated
**Milestone:** v4.1 — Prassi Locali backend completion
**Researched:** 2026-02-19
**Mode:** Features dimension (completing an existing partially-built system)

---

## What Already Exists

Reading the codebase before defining requirements:

**Client-side (done):**
- Submission modal (prassi.js) with city datalist (105 questure), description, date, category, hidden page URL + slug
- Client-side city validation against 105-item allowlist
- Client-side minimum 20-char description validation
- Voting UI with confermo / non confermo buttons
- localStorage-based vote deduplication (24-hour window per prassi ID)
- 429 status code handling in voting client (shows "Troppi voti" message)

**Server-side Netlify functions (done):**
- `submit-prassi.mjs` — validates city + description, creates Notion row with Status=Pending
- `vote-prassi.mjs` — read-increment-write on Notion vote count properties (no server-side dedup)
- `notion-webhook.mjs` — receives webhook, verifies HMAC signature, debounces to 30-min window, triggers Netlify build hook

**Build-time (done):**
- `_data/prassiLocali.js` — fetches only Status=Approved entries from Notion, groups by pageSlug then city
- 11ty templates render grouped data as city-organized cards with vote counts

**Missing:**
1. Netlify rate limiting config on the two endpoint functions
2. Honeypot field on the submission form (server-side check)
3. Server-side vote deduplication (currently only localStorage)
4. Notion automation to trigger rebuild when admin approves a submission
5. Description length cap (no maximum enforced server-side)
6. Clarity on what happens when Notion webhook API sends content_updated events — the existing webhook handler already handles this, but the Notion automation for "Status changes to Approved" needs to be configured in the Notion UI

---

## Table Stakes

Features that must exist for this system to work correctly and be trustworthy. Missing any of these makes the system broken or exploitable.

| Feature | Why Required | Current Status | Complexity |
|---------|-------------|----------------|------------|
| **Server-side field validation** | Client-side validation is trivially bypassed; anything submitted directly to the Netlify function endpoint skips the JS | Done (city whitelist + min-length) | Done |
| **City restricted to 105 questure allowlist** | Prevents free-text abuse; keeps dataset geographically coherent | Done (server-side) | Done |
| **Description minimum length (20 chars) server-side** | Same as above — client-side minimum is UX only | Done | Done |
| **Description maximum length server-side** | Without a cap, a bad actor can submit multi-megabyte payloads per request; Notion API will reject but at cost of a function invocation and an API call | Missing | Low (add to submit-prassi.mjs) |
| **Status=Pending on all new submissions** | Ensures no submission appears on site without admin review | Done | Done |
| **Build-time filter to Approved only** | Prevents pending or rejected content from ever reaching a rendered page | Done (prassiLocali.js) | Done |
| **Rate limiting on submission endpoint** | Prevents trivial flood attacks; even at small scale, 1000 submissions would require admin to triage manually | Missing | Low (Netlify config export) |
| **Rate limiting on voting endpoint** | vote-prassi has no server-side dedup; a single IP can call it in a tight loop | Missing | Low (Netlify config export) |
| **Honeypot field (server-side check)** | First line of bot defense with zero UX cost; effective against simple bots that fill all form fields | Missing | Low |
| **Admin moderation view in Notion** | Without a filtered view, admin cannot efficiently find Pending items | Likely missing (setup task, not code) | Low (Notion config) |
| **Rebuild triggered when admin approves** | Without this, approved content never appears on the site until manual rebuild | Partially done (webhook handler exists; Notion automation not configured) | Medium (Notion paid plan required) |

---

## Differentiators

Features that make the moderation workflow smoother or the user experience better. Not strictly required for the system to function, but meaningfully improve quality.

| Feature | Value Proposition | Complexity | Priority |
|---------|-------------------|------------|----------|
| **Notion filtered view: "Pending review"** | Admin opens one view, sees only what needs a decision — no scanning through full database | Low (Notion setup) | High |
| **Notion filtered view: sorted by submission date ascending** | Oldest-first ordering ensures FIFO moderation; prevents old submissions from getting buried | Low (Notion setup) | High |
| **30-minute build debounce (already implemented)** | Prevents rapid repeated approvals from triggering N rebuilds; batches approvals into one deploy | Done | Done |
| **Success message shows preview of submitted content** | Reassures user their submission was received and accurately captured | Done | Done |
| **Vote counts visible on approved cards** | Signals community consensus to readers; gives admin signal for content quality | Done | Done |
| **Category field on submissions** | Allows future filtering by category (Documenti / Tempi / Sportello etc.) | Done (stored in Notion, not filtered in UI) | Low |
| **Date field on submissions** | Allows readers to assess freshness of reported practice | Done (stored, displayed when present) | Done |
| **Admin can add moderation notes in Notion** | Allows admin to flag borderline submissions for later review without rejecting | Low (add a Notes field in Notion DB) | Medium |
| **Rejection status in Notion** | Without an explicit Rejected status, it's unclear whether Pending = "not reviewed yet" or "under consideration" | Low (add to Status select in Notion) | High |
| **Client-side character counter on description** | Helps users write meaningful content without truncation surprise | Low (JS) | Medium |

---

## Anti-Features

Things to deliberately NOT build. These are over-engineering traps for a system at this scale, or patterns that create more problems than they solve.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Email-based submission verification** | Adds friction, requires email infrastructure, deters honest users who are privacy-conscious | Trust moderation to catch bad content; honeypot + rate limiting is sufficient at this scale |
| **CAPTCHA (reCAPTCHA or hCaptcha)** | Significant UX friction; particularly hostile to users with accessibility needs; overkill for dozens-per-month scale | Honeypot field handles basic bots; rate limiting handles floods; admin moderation catches edge cases |
| **Server-side per-IP vote deduplication via database** | Requires persistent IP storage, GDPR implications, infrastructure overhead; localStorage is sufficient at this scale | Keep localStorage 24h dedup; add server-side rate limiting to catch tight-loop abuse |
| **User accounts or authentication** | Adds major complexity (auth system, session management, account recovery); fundamentally changes the product's anonymous community character | Anonymous submissions with moderation gate are the right model for this use case |
| **AI-powered content classification** | Massive overkill for a low-volume system; adds cost and complexity; moderation queue will be short enough for manual review | Manual admin review; volume is dozens per month, not thousands |
| **Public reporting / "flag this" on approved entries** | Adds complexity; at this scale, errors are surfaced through voting (non confermo) and admin can review periodically | The voting system already surfaces contested entries; admin can inspect non-confirmed entries |
| **Voting history or public vote audit trail** | Unnecessary privacy risk; users at this scale don't need or expect vote transparency | Anonymous voting with aggregate counts is the appropriate model |
| **Webhooks API subscription for every Notion event** | The existing notion-webhook.mjs already handles this; do not add another subscription endpoint | Use existing webhook handler; configure Notion automation in the Notion UI |
| **Custom admin dashboard** | A bespoke admin UI is engineering overhead; Notion already provides a functional database UI with filtering, sorting, and property editing | Configure Notion views properly; let Notion be the moderation interface |
| **Pagination or infinite scroll on prassi entries** | At expected volumes (dozens per city), flat display within each city section is adequate; pagination adds complexity without user benefit | Display all approved entries per city; revisit if any city exceeds ~20 entries |

---

## Security Minimums for Anonymous Submission at Small Scale

This section defines the minimum viable security posture appropriate for the threat model: a small Italian immigration website with anonymous submissions, dozens per month, single admin.

### Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|------------|
| Simple bot filling all form fields | Medium | High (fills admin queue with garbage) | Honeypot field |
| Script submitting repeated identical entries | Low | Medium (queue noise) | Rate limiting: 3 submissions per IP per 3 minutes |
| Vote count manipulation via tight loop | Low | Low (counts are advisory, not consequential) | Rate limiting: 20 votes per IP per 3 minutes |
| Manually crafted spam (human) | Very Low | Medium | Admin moderation gate (Status=Pending) |
| XSS via submitted description | Low | High if rendered without escaping | 11ty Liquid auto-escapes by default; verify no `| raw` filters on user content |
| Payload inflation (huge description) | Low | Low (Notion rejects, costs one function invocation) | Server-side max length cap (e.g. 2000 chars) |
| Arbitrary Notion page ID in voting | Medium | Medium (could increment votes on unrelated pages) | vote-prassi should verify the page is in the Prassi DB before incrementing — currently it does not |

### Minimum Viable Controls (in priority order)

**Priority 1 — Ship-blockers (must have before accepting real submissions):**

1. **Netlify rate limiting on submit-prassi** — IP + domain, 3 requests per 180 seconds. Verified that this format is supported on free/starter plans using the `config` export.

   ```javascript
   export const config = {
     path: "/.netlify/functions/submit-prassi",
     rateLimit: {
       windowLimit: 3,
       windowSize: 180,
       aggregateBy: ["ip", "domain"]
     }
   };
   ```

2. **Netlify rate limiting on vote-prassi** — IP + domain, 20 requests per 180 seconds (more generous; voting is lighter-weight action).

3. **Honeypot field in submission form** — Add a hidden text input named `website` or `url` (not `honeypot` — bots look for that word). Server-side: reject any submission where this field has a non-empty value. Implementation: CSS `display: none` or `position: absolute; left: -9999px`. Do NOT use `input type="hidden"` — modern bots skip those.

4. **Server-side description max length** — Reject descriptions over 2000 characters with HTTP 400.

**Priority 2 — Important but not ship-blockers:**

5. **Verify page belongs to Prassi DB before voting** — vote-prassi.mjs currently reads any Notion page ID. Add a check: retrieve the page, verify `page.parent.database_id === process.env.PRASSI_DB_ID`. Reject with 403 if mismatch.

6. **Status=Approved check before voting** — Only allow voting on approved entries. Currently there's no such check; a user could vote on a pending entry if they know its ID. Minor issue since IDs aren't exposed in the UI, but worth closing.

**Priority 3 — Nice to have:**

7. **Content length display cap in Notion** — No security function; just prevents admin from seeing overwhelmingly long entries. Notion truncates in table views automatically.

### What NOT to Worry About at This Scale

- IP spoofing — sophisticated attack, disproportionate threat level
- Distributed botnet submissions — would require motivated adversary; honeypot + rate limit is sufficient deterrent
- Vote manipulation affecting outcomes — votes are advisory signals, not consequential decisions; admin review is the actual gate
- Privacy of submitters — submissions are anonymous by design; no PII collected

---

## Moderation Workflow — Admin Perspective

The goal is to make moderation so fast that the admin can clear the queue in under 2 minutes per session.

### Ideal Notion Setup (to be configured, not coded)

**Views to create in the Prassi DB:**

| View Name | Filter | Sort | Purpose |
|-----------|--------|------|---------|
| "Da approvare" | Status = Pending | Created time ascending | Primary moderation queue |
| "Approvate" | Status = Approved | City ascending | Browse approved content |
| "Rifiutate" | Status = Rejected | Created time descending | Reference for pattern detection |

**Status values (to configure in Notion):**
- `Pending` — new submission, awaiting review
- `Approved` — approved, will appear on site at next build
- `Rejected` — rejected, will not appear (keep for spam pattern reference)

**Properties to show in the "Da approvare" view (gallery or table):**
- Citta (title)
- Descrizione
- Slug pagina (which permit page this belongs to)
- Data esperienza
- Created time (auto)

### Admin Decision Flowchart

```
New submission arrives in Notion (Status=Pending)
         |
         v
Open "Da approvare" view
         |
         v
Read description:
  - Is it about an actual questura practice?
  - Is the city plausible?
  - Is the description meaningful (>= 30 words is a rough guide)?
         |
    YES  |  NO
    /         \
Approve      Reject
(Status=     (Status=
Approved)    Rejected)
         |
         v
Notion automation fires webhook → notion-webhook.mjs →
30-minute debounce → Netlify build hook → site rebuilds
         |
         v
Approved entry appears on site within ~5 minutes
```

### Edge Cases Admin Will Encounter

| Scenario | What to Do |
|----------|-----------|
| Duplicate submission (same city, same practice, different wording) | Approve whichever is clearer; reject the duplicate |
| Submission from valid city but wrong permit page | Approve if practice is accurate; optionally correct the Slug pagina before approving |
| Practice is plausible but outdated (e.g. "prima del 2022...") | Approve with date noted in Descrizione; the date field will indicate age |
| Description contains personal information (name, phone number) | Reject; submit again without PII |
| Submission in non-Italian language | Current system is Italian-only; reject politely — no reply mechanism exists |
| Very short description (passed 20-char minimum but meaningless) | Reject; the 20-char minimum is the floor, not the quality bar |
| Suspicious burst of identical submissions | Check Created time; if multiple within seconds, honeypot may have failed; reject all; note pattern |
| High non-confermo vote count after approval | Investigate: check if practice is incorrect or controversial; admin can change status back to Pending or Rejected |

### Rebuild Trigger Setup

The Notion automation must be configured in the Notion UI (this is a setup task, not code):

1. In the Prassi database, create an automation: "When Status changes to Approved"
2. Action: "Send webhook" to `https://www.sospermesso.it/.netlify/functions/notion-webhook`
3. The webhook handler (already deployed) will verify the HMAC, check the 30-minute debounce, and trigger the Netlify build hook.

**Important constraint:** Notion webhook actions in database automations require a paid Notion plan. If the workspace is on a free plan, this automation is not available. Alternatives:
- Admin manually triggers Netlify rebuild from the Netlify dashboard after approving entries (30 seconds of overhead)
- Or: Admin clicks a Netlify build hook URL bookmarked in the browser

---

## Feature Dependencies

```
honeypot-field (client) → honeypot-check (server-side in submit-prassi)

rate-limiting-submit → config export in submit-prassi.mjs
rate-limiting-vote   → config export in vote-prassi.mjs

notion-automation-approved → Notion paid plan
notion-automation-approved → notion-webhook.mjs (already deployed)
notion-webhook.mjs → NETLIFY_BUILD_HOOK_URL (already configured)
notion-webhook.mjs → NOTION_WEBHOOK_SECRET (must be set in Notion + Netlify env)

vote-page-verification → vote-prassi.mjs reads PRASSI_DB_ID from env (already set)
```

---

## MVP Definition for v4.1

**Must ship (system is broken without these):**
1. Rate limiting config export on `submit-prassi.mjs` (3 per 3 minutes per IP)
2. Rate limiting config export on `vote-prassi.mjs` (20 per 3 minutes per IP)
3. Honeypot field: add hidden `website` field to form HTML + server-side rejection
4. Description max length: 2000 chars server-side
5. Notion DB setup: Pending/Approved/Rejected status values + "Da approvare" filtered view
6. Rebuild trigger: either Notion automation (if paid plan) or documented manual process

**Should ship (makes system meaningfully better):**
7. Verify page belongs to Prassi DB before voting (security closure)
8. Check Status=Approved before accepting votes (prevents voting on pending entries)
9. Admin Notion views: "Approvate" and "Rifiutate" for reference

**Defer (not needed at current scale):**
- Category filtering in the rendered UI
- Character counter in submission form
- Public entry reporting ("flag this")
- Client-side debounce beyond 24 hours

---

## Confidence Assessment

| Area | Confidence | Source | Notes |
|------|-----------|--------|-------|
| Netlify rate limiting config format | HIGH | Official Netlify docs (verified) | `config` export with `rateLimit` object is confirmed for all plan tiers |
| Honeypot effectiveness 2025 | HIGH | Multiple verified sources; CSS-Tricks authoritative | Use CSS-hidden `text` input, not `type=hidden`; server-side reject if filled |
| Notion automation webhook on status change | MEDIUM | Multiple sources confirm feature exists; plan requirement is confirmed (paid plans only) | Verify current Notion plan before building automation-dependent flow |
| Vote bombing threat at this scale | LOW-MEDIUM | Based on system design analysis; no direct research on comparable small systems | Risk is low given advisory nature of votes; server-side rate limiting is sufficient |
| 30-min build debounce as sufficient | HIGH | Already implemented and designed for this use case | No external research needed; logic is sound for small-volume system |

---

## Sources

- [Netlify Rate Limiting Docs](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/) — config format, plan availability, aggregateBy options (HIGH confidence)
- [Netlify Rate Limiting Blog](https://www.netlify.com/blog/introducing-new-rate-limiting-feature/) — confirms code-based rules on all tiers
- [Netlify Safeguard Guide](https://developers.netlify.com/guides/safeguard-your-sites-from-abuse-with-netlify-rate-limiting/) — practical implementation examples
- [Honeypot Technique - CSS-Tricks](https://css-tricks.com/building-a-honeypot-field-that-works/) — implementation details, why not to use type=hidden
- [Honeypot for Serverless Forms - Medium](https://medium.com/@jp8rock/prevent-spam-form-submission-using-honeypot-field-51d8b929c762) — server-side rejection pattern
- [Notion Webhook Actions Help](https://www.notion.com/help/webhook-actions) — confirms status-change trigger available on paid plans
- [Notion Database Automations](https://www.notion.com/help/database-automations) — trigger types available
- [Netlify Build Hooks](https://docs.netlify.com/build/configure-builds/build-hooks/) — POST-triggered rebuild mechanism
- [UGC Moderation Best Practices - Yotpo](https://www.yotpo.com/glossary/ugc-moderation/) — pre-moderation workflow pattern
- [Form Spam Prevention 2025 - Topmost Labs](https://topmostlabs.com/form-spam-prevention-small-businesses-2025-strategies/) — small-scale strategies

---

*Researched for v4.1 Prassi Locali milestone — features dimension only*
*This file does not replace FEATURES.md (homepage CSS redesign)*
