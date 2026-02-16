# Permit Content Audit Report

**Generated:** 2026-02-16
**Phase:** 44.1-01

## Overview

Audited 64 static permit HTML files against Notion-generated content.

### Summary

| Category | Count | Safe to Redirect? |
|----------|-------|-------------------|
| Redirect-only | 1 | ✓ Yes |
| Placeholder | 0 | ✓ Yes |
| Equivalent | 7 | ✓ Yes |
| Unique content | 22 | ✗ **Migration needed** |
| Parent needed | 4 | — See Plan 02 |
| Error | 0 | — Investigate |

**Safe to redirect:** 8/64
**Needs migration:** 22

## Detailed Audit Results

| Static File | Category | Canonical Target | Notes |
|-------------|----------|------------------|-------|
| ⚠️ permesso-asilo-politico.html | unique-content | permesso-asilo-status-rifugiato | 3/8 questions need migration: ❓ come posso ottenerlo?, 💼 cosa posso fare con questo permesso? |
| ✓ permesso-asilo.html | redirect-only | permesso-richiesta-asilo | Already a redirect |
| ⚠️ permesso-assistenza-minore.html | unique-content | permesso-assistenza-minore-art-31 | 3/7 questions need migration: 📝 che cos'è?, ⏱️ quanto dura? |
| ⚠️ permesso-attesa-occupazione.html | unique-content | permesso-attesa-occupazione-art-22 | 4/9 questions need migration: 📝 che cos'è?, ❓ chi può chiederlo? |
| ⚠️ permesso-calamita-naturale.html | unique-content | permesso-calamita-naturale-art-20-bis | 3/5 questions need migration: ❓ quando puoi chiederlo?, 📍 come si chiede questo permesso? |
| ✓ permesso-coesione-familiare.html | equivalent | permesso-famiglia-o-motivi-familiari-senza-nullaosta-per-ricongiungimento-coesione | All content covered in Notion |
| ⚠️ permesso-conviventi-familiari-italiani.html | unique-content | permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19 | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-cure-mediche-art-36-d-lgs-286-1998.html | unique-content | permesso-cure-mediche-dopo-ingresso-con-visto-art-36 | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-cure-mediche-ex-art-19-comma-2-lett-d-bis.html | unique-content | permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia | 1/2 questions need migration: contenuto in arrivo |
| ✓ permesso-cure-mediche-per-donna-in-stato-di-gravidanza-e-padre-del-bambino-art-19.html | parent | PARENT | Needs parent/hub page (Plan 02) |
| ⚠️ permesso-cure-mediche.html | unique-content | permesso-cure-mediche-dopo-ingresso-con-visto-art-36 | TARGET FILE NOT FOUND (canonical page missing) |
| ✓ permesso-donna-in-stato-di-gravidanza-e-padre-del-bambino.html | parent | PARENT | Needs parent/hub page (Plan 02) |
| ⚠️ permesso-famiglia-motivi-famigliari-art-19.html | unique-content | permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19 | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-famiglia-motivi-famigliari-art-30-dopo-ingresso-con-nullaosta.html | unique-content | permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-famiglia-motivi-familiari-art-30-dopo-ingresso-con-nullaosta.html | unique-content | permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare | TARGET FILE NOT FOUND (canonical page missing) |
| ✓ permesso-famiglia-motivi-familiari-art-30-senza-nullaosta-coesione.html | equivalent | permesso-famiglia-o-motivi-familiari-senza-nullaosta-per-ricongiungimento-coesione | All content covered in Notion |
| ⚠️ permesso-famiglia-motivi-familiari-convivente-con-parente-cittaadino-italiano-art-19.html | unique-content | permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19 | TARGET FILE NOT FOUND (canonical page missing) |
| ✓ permesso-familiari-di-cittadini-ue-carta-ue.html | equivalent | permesso-carta-di-soggiorno-per-familiari-di-cittadini-ue-d-lgs-30-07 | All content covered in Notion |
| ✓ permesso-familiari-di-italiani-dinamici-carta-ue.html | equivalent | permesso-carta-di-soggiorno-per-familiari-di-italiani-dinamici-d-lgs-30-07 | All content covered in Notion |
| ✓ permesso-famit-familiari-italiani-statici.html | equivalent | permesso-famit-per-familiari-di-cittadini-italiani-statici | All content covered in Notion |
| ✓ permesso-famit-per-familiari-di-cittidini-statici.html | equivalent | permesso-famit-per-familiari-di-cittadini-italiani-statici | All content covered in Notion |
| ✓ permesso-genitore-di-cittadino-italiano.html | equivalent | permesso-famiglia-per-genitore-di-cittadino-italiano-art-30 | All content covered in Notion |
| ⚠️ permesso-genitore-minore-italiano.html | unique-content | permesso-famiglia-per-genitore-di-cittadino-italiano-art-30 | 2/7 questions need migration: 📝 che cos'è?, 💼 cosa posso fare con questo permesso? |
| ⚠️ permesso-gravi-motivi-salute.html | unique-content | permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia | 5/11 questions need migration: 📝 che cos'è?, 💰 quanto costa? |
| ⚠️ permesso-gravidanza.html | unique-content | permesso-cure-mediche-art-19-donna-in-stato-di-gravidanza | TARGET FILE NOT FOUND (canonical page missing) |
| ✓ permesso-lavoro-autonomo.html | parent | PARENT | Needs parent/hub page (Plan 02) |
| ⚠️ permesso-minori-stranieri-affidati.html | unique-content | permesso-affidamento-a-familiari-entro-il-quarto-grado | 3/7 questions need migration: 📝 che cos'è?, ⏱️ quanto dura? |
| ⚠️ permesso-persona-gravemente-malata-che-si-trova-gia-in-italia.html | unique-content | permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia | 3/11 questions need migration: 📋 che documenti ti servono?, 💰 quanto costa? |
| ⚠️ permesso-prosieguo-amministrativo.html | unique-content | permesso-integrazione-prosieguo-amministrativo | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-prosieguo-amministravo.html | unique-content | permesso-integrazione-prosieguo-amministrativo | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-protezione-speciale-art-32-d-lgs-25-2008.html | unique-content | permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008 | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-protezione-speciale.html | unique-content | permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008 | TARGET FILE NOT FOUND (canonical page missing) |
| ⚠️ permesso-ricongiungimento-familiare.html | unique-content | permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare | TARGET FILE NOT FOUND (canonical page missing) |
| ✓ permesso-studio.html | parent | PARENT | Needs parent/hub page (Plan 02) |

## Duplicate Entries in Notion

The following entries were identified in Phase 43 and need filtering in permits.js (Plan 02):

- duplicate-attivita-sportiva
- duplicate-motivi-religiosi
- duplicate-residenza-elettiva

These are already prefixed with [DUPLICATE] in Notion but still generate pages in _site/. They will be filtered out in permits.js.

## Files Requiring Content Migration

### permesso-asilo-politico.html

- **Target:** permesso-asilo-status-rifugiato
- **Issue:** 3/8 questions need migration: ❓ come posso ottenerlo?, 💼 cosa posso fare con questo permesso?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-assistenza-minore.html

- **Target:** permesso-assistenza-minore-art-31
- **Issue:** 3/7 questions need migration: 📝 che cos'è?, ⏱️ quanto dura?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-attesa-occupazione.html

- **Target:** permesso-attesa-occupazione-art-22
- **Issue:** 4/9 questions need migration: 📝 che cos'è?, ❓ chi può chiederlo?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-calamita-naturale.html

- **Target:** permesso-calamita-naturale-art-20-bis
- **Issue:** 3/5 questions need migration: ❓ quando puoi chiederlo?, 📍 come si chiede questo permesso?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-conviventi-familiari-italiani.html

- **Target:** permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-cure-mediche-art-36-d-lgs-286-1998.html

- **Target:** permesso-cure-mediche-dopo-ingresso-con-visto-art-36
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-cure-mediche-ex-art-19-comma-2-lett-d-bis.html

- **Target:** permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia
- **Issue:** 1/2 questions need migration: contenuto in arrivo
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-cure-mediche.html

- **Target:** permesso-cure-mediche-dopo-ingresso-con-visto-art-36
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-famiglia-motivi-famigliari-art-19.html

- **Target:** permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-famiglia-motivi-famigliari-art-30-dopo-ingresso-con-nullaosta.html

- **Target:** permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-famiglia-motivi-familiari-art-30-dopo-ingresso-con-nullaosta.html

- **Target:** permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-famiglia-motivi-familiari-convivente-con-parente-cittaadino-italiano-art-19.html

- **Target:** permesso-famiglia-motivi-familiari-convivente-con-parente-cittadino-italiano-art-19
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-genitore-minore-italiano.html

- **Target:** permesso-famiglia-per-genitore-di-cittadino-italiano-art-30
- **Issue:** 2/7 questions need migration: 📝 che cos'è?, 💼 cosa posso fare con questo permesso?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-gravi-motivi-salute.html

- **Target:** permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia
- **Issue:** 5/11 questions need migration: 📝 che cos'è?, 💰 quanto costa?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-gravidanza.html

- **Target:** permesso-cure-mediche-art-19-donna-in-stato-di-gravidanza
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-minori-stranieri-affidati.html

- **Target:** permesso-affidamento-a-familiari-entro-il-quarto-grado
- **Issue:** 3/7 questions need migration: 📝 che cos'è?, ⏱️ quanto dura?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-persona-gravemente-malata-che-si-trova-gia-in-italia.html

- **Target:** permesso-cure-mediche-per-persona-gravemente-malata-che-si-trova-gia-in-italia
- **Issue:** 3/11 questions need migration: 📋 che documenti ti servono?, 💰 quanto costa?
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-prosieguo-amministrativo.html

- **Target:** permesso-integrazione-prosieguo-amministrativo
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-prosieguo-amministravo.html

- **Target:** permesso-integrazione-prosieguo-amministrativo
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-protezione-speciale-art-32-d-lgs-25-2008.html

- **Target:** permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-protezione-speciale.html

- **Target:** permesso-protezione-speciale-dopo-decisione-positiva-della-commissione-o-del-tribunale-art-32-d-lgs-25-2008
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

### permesso-ricongiungimento-familiare.html

- **Target:** permesso-famiglia-motivi-familiari-dopo-ingresso-con-nullaosta-per-ricongiungimento-familiare
- **Issue:** TARGET FILE NOT FOUND (canonical page missing)
- **Action:** Extract unique Q&A from static file and add to Notion page

