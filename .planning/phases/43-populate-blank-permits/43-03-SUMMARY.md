# Summary: 43-03 Populate lavoro category permits

**Status:** Partial — 2 of 5 populated, 3 skipped
**Date:** 2026-02-16

## Permits Populated

| Permit | Notion ID | Blocks | Status |
|--------|-----------|--------|--------|
| Attività sportiva (art.27) | `2dc7355e-7f7f-80d8-b0a5-c82c9b24043c` | 35 | Populated |
| Ricerca scientifica (art.27ter) | `1ad7355e-7f7f-8067-ad48-ef7ac7a43a83` | 32 | Populated |

## Permits Skipped (user decision)

| Permit | Notion ID | Reason |
|--------|-----------|--------|
| Tirocinio | `1ad7355e-7f7f-80b1-bf0e-ced1be3cd742` | User doesn't recognize — may not belong in DB |
| Lavoro artistico | `1ad7355e-7f7f-805b-ba6b-dbff5529fc7f` | User doesn't recognize — may not belong in DB |
| Lavoro subordinato a seguito di sanatoria | `1ad7355e-7f7f-8054-a4a1-e9f4a31686d4` | User requested skip |

Content was written and then reverted for these 3 permits. They remain blank (0 blocks).

## Issue Discovered: Database ID Mismatch

**User's Notion DB link:** `1a27355e-7f7f-80cc-96ff-e9d109d7f8f9`
**Code (permits.js) uses:** `1ad7355e-7f7f-8088-a065-e814c92e2cfd`

These are different IDs. The API-accessible database has 47 pages and the build works correctly. But the user doesn't see Tirocinio/Lavoro artistico in their view — these entries may have been created by old migration scripts.

## Content Rules Applied

- No inline document lists — linked to "che documenti porto" pages instead
- Cost breakdown: bollettino includes electronic permit cost (no separate 40€ line)
- Full URLs for Notion links (`https://www.sospermesso.it/...`)

## Build Verification

- Build completes (398 files)
- Populated permits show Q&A cards, no placeholder text
- Document page links functional
