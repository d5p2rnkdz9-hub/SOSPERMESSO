# Phase 41: Prassi Locali MVP - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Crowdsourced local questura practices on document pages. Users can submit practical tips about how specific questure handle procedures, view approved practices grouped by city, and vote to confirm or deny accuracy. Submissions go through manual moderation in Notion before appearing on the site.

Scope: submission form, display section, voting system, Notion moderation workflow, Netlify Functions for dynamic operations. Pre-approved user auth and advanced contributor management are future phases.

</domain>

<decisions>
## Implementation Decisions

### Submission flow
- Modal overlay form (like the existing contact form pattern)
- Triggered by an "Aggiungi la tua esperienza" button
- Required fields: city (autocomplete/typeahead from predefined questure list) + free-text description
- Optional fields: date (when it happened) + category tag
- After submit: show thank-you message + preview of the submitted practice with "in attesa di approvazione" visual treatment
- Form submits via Netlify Function to Notion DB

### Display & filtering
- "Prassi locali" section positioned after main document content, with a visible anchor/link in the page header so users can jump to it
- MVP: flat display showing all cities that have content (no accordion yet — expected low volume initially)
- Grouped by city, all visible
- Empty state: "Nessuna segnalazione ancora. Sei il primo a condividere la tua esperienza!" with submit button
- Approved practices baked into pages at build time (static core)

### Voting system
- "Confermo" / "Non confermo" framing (not thumbs up/down — this is community fact-checking, not liking)
- Both counts displayed separately (e.g. "Confermo: 12 | Non confermo: 3") — not a net score
- Dynamic/real-time: votes sent to Netlify Function, stored in DB, displayed via client-side JS fetch
- Abuse prevention: Claude's discretion (localStorage + IP rate limiting as needed)

### Moderation workflow
- Single Notion DB with Status property: Pending → Approved → Published (or Rejected)
- Rejected submissions stay in DB marked as "Rejected" (kept for reference, never published)
- No notifications — moderator checks Notion DB periodically
- Webhook auto-deploy: Notion webhook triggers Netlify build when status changes to Approved
- Only "Approved" status items are fetched by the 11ty data file and baked into pages

### Claude's Discretion
- Vote abuse prevention implementation details (localStorage vs IP vs combination)
- Exact autocomplete/typeahead implementation for city field
- Category tag options (if any predefined list)
- Card/list styling for individual practices within city groups
- Netlify Function architecture (single vs multiple functions)

</decisions>

<specifics>
## Specific Ideas

- Voting framed as "confermo" / "non confermo" — not like/dislike, but community verification of factual accuracy
- Post-submit should show a preview of what was submitted, visually distinct (grayed out or badge) to set expectations about moderation
- Anchor link in page header for quick navigation to prassi section
- The "invite to contribute" empty state should feel encouraging, not empty

</specifics>

<deferred>
## Deferred Ideas

- Accordion/collapsible city grouping — upgrade when volume grows beyond flat display
- Pre-approved user auth for trusted contributors (Netlify Identity or access codes)
- User management in Notion/Supabase
- Scheduled builds as alternative to webhook auto-deploy
- Email/notification system for new submissions

</deferred>

---

*Phase: 41-prassi-locali-mvp*
*Context gathered: 2026-02-09*
