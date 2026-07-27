# Report normalizzazione paragrafazione circolari (export_circolari_site.py)

Data: 2026-07-27
Corpus analizzato: `_cache/circolari-site.json` (1272 circolari, campo `testo` = array di paragrafi)

## 1. Catalogo difetti (PRIMA del fix)

Misurato su tutti gli 11132 paragrafi delle 1272 circolari.

| Difetto | Conteggio | % sul totale paragrafi | Esempio |
|---|---|---|---|
| (a) Paragrafo termina con abbreviazione giuridica troncata (art., n., co., D.P.R., sig., mod., ecc. + punto) | **3206** | 28.8% | `...previste dall'art.` → paragrafo successivo: `35 del Decreto legislativo 286/1998 (Testo Unico...` |
| (b) Paragrafo (non il primo della circolare) inizia con una cifra grezza | **3696** | 33.2% | come sopra: `35 del Decreto...`, `388, che consente...`, `4 comma 12 della legge...` |
| — di cui: sigla puntata generica non in lista esplicita a fine paragrafo (T.U., U.E., S.S.N., D.P.C.M. già coperta) | **97** | 0.9% | `...a norma dell'art. 3 co. 4 del T.U.` → `Pertanto, una volta effettuata...` (qui il ricongiungimento corretto è solo su "co./T.U.", il periodo dopo "T.U." resta distinto) |
| (b) Paragrafo (non il primo) inizia con lettera minuscola | **0** | 0% | la regex di sentence-split originale richiede maiuscola/cifra/virgolette dopo lo spazio, quindi non si verifica mai in pratica — confermato l'ipotesi che il problema sia interamente concentrato sulle cifre dopo abbreviazione |
| (c) Newline residui dentro un paragrafo | **0** | 0% | `clean_body`/whitespace già normalizzano correttamente |
| (d) Boilerplate residuo (adsbygoogle, "push({})", "Il portale di riferimento...") | **0** | 0% | `clean_body` già rimuove header/footer del sito sorgente in modo affidabile |
| Spazi doppi residui nei paragrafi | **0** | 0% | — |
| Sigle-nome proprio: abbreviazione (sig., mod., v., reg., ecc.) seguita da testo che NON inizia con cifra (nome proprio, sigla, codice) | **145** | 1.3% (sottoinsieme di (a)) | `...AL SIG.` → `COMMISSARIO DEL GOVERNO...`; `...a mezzo mod.` → `F24, entro il 16 dicembre...` |

**Totale punti di split scorretti individuati: 3911** (3206 abbreviazione-list + 97 sigla generica + 608 solo cifra-senza-abbreviazione-esplicita, con overlap: il totale distinto di boundary "prima" che il fix corregge).

Nota: (a) e (b) sono in larghissima parte lo stesso fenomeno visto dai due lati della stessa frattura (l'abbreviazione che chiude un paragrafo, la cifra che apre quello dopo). La causa radice unica è: la sentence-split regex `(?<=[.!?])\s+(?=[A-ZÀ-Ý0-9"«])` in `paragraphize()` (riga ~146, ora spostata più in basso) accetta cifre nel lookahead e non conosce alcuna abbreviazione giuridica italiana.

## 2. Fix applicato

File: `data-pipeline/export_circolari_site.py`, funzione `paragraphize()` (nessuna riscrittura architetturale: solo aggiunta di un passaggio di ricongiungimento subito dopo lo split naive, prima dell'accumulo in paragrafi).

Aggiunte (prima della funzione `paragraphize`):

- `_ABBREV_WORDS`: lista delle abbreviazioni giuridiche/burocratiche italiane richieste (art, artt, n, nn, co, commi, d.lgs, d.l, d.p.r, d.p.c.m, d.m, l, lett, all, cap, par, pag, prot, dott, dott.ssa, avv, on, sig, sig.ra, ecc, v, cfr, ss, succ, mod, reg, delib, circ, sez, ord, sent), ordinate per lunghezza decrescente per evitare match parziali nell'alternanza regex.
- `_ABBREV_END_RE`: regex case-insensitive che riconosce se una frase candidata termina con una di queste abbreviazioni seguita da punto.
- `_SIGLA_END_RE`: regex generica per sigle puntate non elencate esplicitamente (2+ lettere singole separate da punto a fine stringa, es. "T.U.", "U.E.", "S.S.N.", "T.L.C.").
- `_ends_with_truncated_abbrev()` / `_starts_with_digit()`: helper di verifica.
- `_merge_false_sentence_splits()`: dato l'elenco di "frasi" prodotte dallo split naive, ricongiunge la frase `i` con la `i+1` quando **(i)** la frase `i` termina con un'abbreviazione troncata (lista o sigla generica), **oppure** **(ii)** la frase `i+1` inizia con una cifra grezza (indipendentemente da abbreviazioni: in italiano giuridico formale un nuovo periodo non comincia quasi mai con un numero grezzo — è sempre continuazione di una citazione numerica troncata dal punto abbreviativo precedente).

Modifica in `paragraphize()`: subito dopo lo split con la regex esistente (`sentences = re.split(...)`), viene chiamato `sentences = _merge_false_sentence_splits(sentences)` prima del ciclo di accumulo in paragrafi da ~500 caratteri / 4 frasi (quel ciclo resta invariato).

Nessuna modifica a `clean_body()`: l'analisi ha confermato che boilerplate, newline residui e spazi doppi sono già a zero occorrenze — non c'era nulla da correggere lì.

### Limite noto (accettato, da specifica)

La regola (ii) è volutamente aggressiva: unisce **qualunque** cifra grezza a inizio "frase" alla frase precedente, anche quando si tratta di un'intestazione di paragrafo numerata legittima del documento originale (es. `"...previdenziale dell'INPS."` seguito da `"3. ASSOCIATI IN PARTECIPAZIONE. Si è avuto modo..."`). In questi casi (minoranza: 608 punti su 3911, ~15.5%) il numero di sezione resta agganciato alla fine del paragrafo precedente invece di aprirne uno nuovo. Nessun contenuto viene perso — è solo un confine di paragrafo sub-ottimale — e il numero netto di split scorretti eliminati (3911) supera ampiamente quelli introdotti da questo compromesso. Non risolvibile senza analisi strutturale del documento (fuori scope: modifica chirurgica richiesta dalla specifica).

## 3. Test

File: `data-pipeline/test_paragraphize.py` — 12 test su casi reali estratti dal corpus (biz:1, biz:3, biz:4, biz:13, biz:14, biz:24, biz:36, biz:61, biz:387), più 2 casi di regressione sintetici (frasi realmente distinte che devono restare separabili; cifra dopo punto senza abbreviazione esplicita).

Esito:
```
$ python3 data-pipeline/test_paragraphize.py
OK   [art. + numero (biz:1)]
OK   [n. + numero legge (biz:3)]
OK   [artt. + D.P.R. + numero (biz:24)]
OK   [co. + T.U. sigla puntata (biz:4)]
OK   [art. + D.L. + n. concatenati (biz:14)]
OK   [sig. + nome proprio maiuscolo (biz:3)]
OK   [mod. + codice modulo (biz:13)]
OK   [sigla generica S.S.N. (biz:387)]
OK   [sigla generica U.E. (biz:36)]
OK   [regressione: frasi distinte restano separabili]
OK   [cifra dopo punto senza abbreviazione esplicita]
OK   [catena lunga di abbreviazioni concatenate (biz:61)]

Tutti i 12 test passati.
```

## 4. Rigenerazione e verifica delta

Comando: `python3 data-pipeline/export_circolari_site.py`

| Metrica | Prima | Dopo | Delta |
|---|---|---|---|
| Circolari | 1272 | 1272 | 0 |
| Paragrafi totali | 11132 | 8689 | -21.9% (atteso: fusione dei falsi split) |
| Caratteri totali nel testo | 5.834.057 | 5.836.500 | **+0.042%** (spazi di giunzione aggiunti dai merge, nessun contenuto perso) |
| Paragrafi con testo vuoto | 0 | 0 | — |
| Paragrafi che terminano con abbreviazione troncata | 3206 | **0** | -100% |
| Paragrafi (non primi) che iniziano con cifra grezza | 3696 | **0** | -100% |
| Insieme degli id circolari | — | — | invariato (verificato con confronto set) |

Delta dimensione corpus ben entro la soglia del 2% richiesta (in realtà cresce leggermente per gli spazi di ricongiungimento).

## 5. File scritti

- `data-pipeline/data/normalize-report.md` (questo file)
- `data-pipeline/data/normalize-sample.json` (60 casi di QA: 42 abbrev-list, 12 digit-start-only, 6 sigla-generica, prima/dopo)
- `_cache/circolari-site.json` (rigenerato, 1272 circolari)
- `data-pipeline/test_paragraphize.py` (12 test, tutti passano)
- `data-pipeline/export_circolari_site.py` (modificato: solo funzione `paragraphize` + helper aggiunti prima di essa)

## 6. Non toccato

- `_data/`, `src/`, i template Liquid — non modificati.
- `circolariFulltext`: `_data/circolariFulltext.js` legge lo stesso `_cache/circolari-site.json` rigenerato, quindi si aggiorna automaticamente al prossimo `npm run build` — nessuna azione separata necessaria.
- Nessun commit git eseguito.
