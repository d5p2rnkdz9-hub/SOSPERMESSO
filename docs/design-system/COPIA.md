# Copia del design system «SOSpermesso — Adesivo»

**Fonte di verità:** l'artifact su claude.ai
https://claude.ai/artifact/VsgC5Qtuj4iLQV5HoUmYnc
(mockup approvati di home e volantino: https://claude.ai/artifact/7qB7JS7HT1Y2z6zgNDz7rv).

Questa cartella è una **copia di riferimento** presa l'8 ottobre 2026 (versione dell'artifact
`1791480893-a424`, contenuto identico alla `1791467215-8388` usata per applicare il design al sito).
Se l'artifact cambia, questa copia **non** si aggiorna da sola: va riscaricata.

| File | Contenuto |
|---|---|
| `README.md` | Principi, tono, colore, tipografia, forma «adesivo», componenti |
| `tokens.json` | Token: colori, font, spazi, raggi, bordi, ombre |
| `tokens.css` | Gli stessi token come variabili CSS (generato da `tokens.json`) |
| `design-system.json` | Indice dell'artifact (gruppi di asset, id delle icone) |
| `components/<Nome>/` | README + `preview.html` di NavPill, TestCard, CategoryCard, PermitCard, GuideCard, Checklist, Alert, Stamp, Cover |
| `icons/` | Le 20 icone a linea in SVG + README d'uso |
| `logos/README.md` | Regole d'uso del logo (il file è `IMAGES/logo-full-600.png`) |

Le `preview.html` usano le variabili CSS dei token senza definirle (nell'artifact le fornisce
la pagina che le ospita): per aprirle in locale aggiungi nel `<head>`
`<link rel="stylesheet" href="../../tokens.css">`.

**Nel sito** il design è applicato così: token in `src/styles/main.css`, icone in
`_includes/components/icon.liquid`, home in `_includes/components/home.liquid` + `home.css`,
database in `database.css`, checklist e avvisi in `document-page.css`.
La cartella `docs/` è esclusa dalla build di 11ty (`eleventy.config.mjs`).
