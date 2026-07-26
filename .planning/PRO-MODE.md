# Versione PRO — lato sito (demo 2026-07)

Modalità per operatori professionali (CAF, patronati, sportelli legali),
condivisa con l'app Next.js. Design completo: `app/docs/SPORTELLO-MODE.md`
(repo app, sezione "REVISIONE 2026-07-26").

## Come funziona

- **Stato per-device**: `localStorage['sos-mode']='pro'` + cookie `sos_mode`
  su `.sospermesso.it` (condiviso con app.sospermesso.it). Applicato pre-paint
  da script inline in `base.liquid` → `data-mode="pro"` su `<html>`.
- **Toggle**: `#pro-toggle` in `_includes/components/header.liquid`; logica in
  fondo a `src/scripts/app.js` (aggiunge `html.mode-transition` per ~450ms →
  smooth color morph, vedi `pro.css`).
- **Tema**: `src/styles/pro.css`. Layout identico; navy (#1B3A5C) al posto del
  giallo brand, giallo che resta come accento. Override sia delle CSS var
  (`--taxi-yellow` ecc.) sia dei componenti con colori hardcoded
  (`.btn-primary`, homepage `--hr-*`). NB: `mobile.css` mette
  `button{width:100%}` sotto i 768px → `.pro-toggle` ha `width:auto !important`.
- **Contenuti PRO**: visibili solo in PRO via `.pro-only` / `.pro-only-inline`.
  - Sezione `#pro` ("Scheda PRO") in `src/pages/permits.liquid`: sintesi
    professionale, norme con link, sentenze con massima-teaser sfocata dietro
    paywall demo, circolari chiave + circolari collegate dal DB esistente
    (`circolariDb`, filtrate per slug).
  - Chip "PRO" nelle righe di `database.html` (condizionale
    `proContent.permits[p.slug]`, presente su tutte le 41 righe).
- **Dati**: `_data/proContent.js` legge il canonical
  `../pro-content-shared/pro-content.json` e sincronizza lo snapshot committato
  `_cache/pro-content.json` (unica fonte disponibile su Netlify, dove il
  sibling non esiste).

## Contenuti demo (bozza da validare legalmente)

3 permessi: `protezione-speciale`,
`lavoro-subordinato-dopo-ingresso-con-visto-per-flussi`,
`ue-per-soggiornanti-di-lungo-periodo-carta-di-soggiorno`.
Ricerca web con regola anti-allucinazione (ogni sentenza verificata su una
fonte aperta, confidenza dichiarata). `draft: true` → badge "Bozza" in UI.

## Percorso di produzione (post-demo)

1. Validazione legale dei contenuti (Alberto) → `draft: false`.
2. Migrare i contenuti in un DB Notion (pattern `rinnovo-notion-data.generated.ts`).
3. Paywall reale: account + entitlements (vive nell'app; il sito potrà leggere
   lo stato abbonamento da un cookie/endpoint condiviso).
4. Estendere le schede PRO agli altri 38 permessi.
