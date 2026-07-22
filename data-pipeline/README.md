# Data pipeline — circolari e materiale giuridico

Scraper e database delle circolari in materia di immigrazione da aggregatori pubblici.
Creato a maggio 2026 (sessione "Add legal resources and case law to website"),
recuperato nel repo principale a luglio 2026. Base dati per la futura sezione
"giurisprudenza e circolari per permesso" del sito.

## Contenuto

- `cli.py` — entrypoint: `init`, `scrape <source> --start N --end M`, `sync-biz` (incrementale), `stats`
- `db.py` — schema SQLite + connessione (`data/circolari.db`)
- `sources/immigrazione_biz.py`, `sources/permessidisoggiorno.py` — scraper per i due aggregatori
- `sources/common.py` — client HTTP (httpx), rate limiter, parsing condiviso (selectolax)
- `dedup.py`, `verify.py` — dedup e controlli qualità
- `data/circolari.db` — **versione slim** (12 MB): 2.157 documenti, colonne
  metadati + `testo_plain`. Le colonne `raw_html` e `testo_html` sono state rimosse
  per stare nel repo (GitHub rifiuta file >100 MB).
- `data/circolari.csv` — export tabellare dei soli metadati

## Versione completa (con raw_html)

La versione integrale del DB (136 MB, con snapshot HTML delle pagine sorgente,
ri-parsabile se il parsing migliora) è FUORI dal repo:

```
~/Desktop/TECH/SOSpermesso/BACKUPS/circolari-full-20260715.db
```

## Stato dati (luglio 2026)

| Metrica | Valore |
|---|---|
| Documenti totali | 2.157 |
| — da immigrazione.biz | 1.269 |
| — da permessidisoggiorno.info | 888 |
| Copertura date | 1961 → marzo 2026 |
| Con `testo_plain` (>200 char) | 1.272 (59%) |
| Con `oggetto` compilato | 137 |
| Con `pdf_url` | 6 |

Enti principali: Ministero dell'Interno (963), Ministero del Lavoro (126), INPS (108),
Governo (57), Cassazione (39), Min. Infrastrutture (33), TAR Lazio (32).

## Uso

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
python cli.py stats
python cli.py sync-biz          # aggiornamento incrementale immigrazione.biz (auto-rileva i nuovi id)
```

Lo scrape è ripartente: `fetch_log` traccia gli id già processati.

## Avvertenze legali

I documenti ufficiali (circolari, note, decreti) sono atti dello Stato liberi da
diritto d'autore (art. 5 l. 633/1941). **Non riutilizzare titoli/riassunti
redazionali degli aggregatori sorgente** (diritto sui generis sulle banche dati):
per la pubblicazione sul sito generare titoli e massime propri.
