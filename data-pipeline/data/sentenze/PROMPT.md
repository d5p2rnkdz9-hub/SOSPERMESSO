# Fase 2 — Preparazione sentenze IMMIGRAZBOT per pubblicazione su SOS Permesso

Sei un esperto di diritto dell'immigrazione italiano. Per OGNI record del manifest
assegnato devi LEGGERE il file markdown indicato in `path` e produrre un oggetto
di output. L'obiettivo è pubblicare queste decisioni sul sito con titoli decenti
e SENZA dati personali.

## Output: un oggetto per record

```json
{
  "id": "kb:...",
  "titolo_pubblico": "...",
  "contenuto": "integrale" | "sintesi" | "massima" | "misto",
  "anonimizzazione": "ok" | "nomi_in_chiaro" | "dubbio",
  "dati_personali": ["..."],
  "qualita": "pubblicabile" | "da_rivedere" | "scartare",
  "nota": "..."
}
```

## Regole per `titolo_pubblico`

Formato: `{Autorità abbreviata}, {tipo provvedimento} {data leggibile}[, n. {numero}] — {tema in 4-10 parole}`

- Autorità abbreviate: `Trib. Bologna`, `Cass. civ.`, `Cass. SS.UU.`, `C. App. Torino`,
  `TAR Lazio`, `Cons. Stato`, `Corte cost.`, `CGUE`, `Corte EDU`, `Giud. pace Roma`,
  `Comm. terr. Milano`. Ricava città/sezione dal testo o dai metadati.
- Data in formato `12.3.2024`. Se manca nel record, cercala nel testo.
- Il tema finale deve dire COSA decide (es. "riconoscimento status di rifugiata per rischio di tratta"),
  non ripetere il nome del permesso e basta. MAI nomi di persone nel titolo,
  nemmeno solo il cognome del ricorrente. Nazionalità ok se rilevante.
- Esempio: `Trib. Bologna, decreto 13.10.2022 — protezione per vittima di tratta nigeriana`

## Regole per `contenuto`
- `integrale`: il md contiene il testo completo del provvedimento
- `sintesi`: riassunto discorsivo/strutturato del provvedimento
- `massima`: solo principio di diritto in poche righe
- `misto`: massima/sintesi + stralci testuali

## Regole per `anonimizzazione` — GATE BLOCCANTE
Cerca nel testo: nomi e cognomi di ricorrenti/parti private, date di nascita,
codici fiscali, indirizzi privati, numeri di procedimento abbinabili a persone.
- `ok`: nessun dato personale in chiaro (XXX, omissis, iniziali sono ok)
- `nomi_in_chiaro`: elenca in `dati_personali` OGNI dato trovato (serve per la redazione successiva)
- `dubbio`: casi limite (es. solo iniziali + città + data nascita insieme)
NON contano come dati personali: nomi di giudici/presidenti/estensori, avvocati,
pubblici ufficiali nell'esercizio delle funzioni, enti.

## Regole per `qualita`
- `pubblicabile`: è una decisione vera, comprensibile, con estremi identificabili
- `da_rivedere`: manca qualcosa (estremi incerti, testo confuso) — spiega in `nota`
- `scartare`: non è una decisione (appunti, bozze, atti di parte, doc duplicato/troncato)

## Istruzioni operative
1. Leggi il manifest assegnato `data/sentenze/manifest-NNN.json`
2. Per ogni record leggi il file `path` (LEGGI DAVVERO ogni file, niente scorciatoie sui metadati)
3. Scrivi l'array completo in `data/sentenze/out-NNN.json` (stesso NNN, stessi id, JSON valido)
4. Non toccare nessun altro file
