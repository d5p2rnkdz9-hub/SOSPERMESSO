# Estrazione metadati circolari per titoli pubblicabili

Per OGNI record del batch assegnato produci un oggetto:

```json
{
  "id": "biz:N",
  "oggetto": "...",
  "ente": "...",
  "numero": "..."
}
```

Regole:
- `oggetto`: UNA riga (max 120 caratteri) che dice di cosa tratta la circolare,
  ricavata dall'`estratto` (di solito l'oggetto ufficiale è all'inizio). Stile
  sobrio da oggetto ministeriale, niente punto finale, iniziale maiuscola.
  Es.: "Assistenza sanitaria ai cittadini rumeni e bulgari privi di copertura sanitaria".
  Se l'estratto è vuoto o incomprensibile, ricava il meglio possibile dal titolo;
  se davvero non c'è nulla, usa "".
- `ente`: conferma quello esistente, oppure ricavalo da estratto/titolo se mancante
  (es. "Ministero dell'Interno", "INPS", "Ministero del Lavoro e delle Politiche Sociali").
  Se non determinabile: "".
- `numero`: conferma o ricava il numero di protocollo/circolare se presente; altrimenti "".
- NON inventare: se un dato non è nel testo, lascia "".
- Output: array JSON in `data/circolari-meta/out-NNN.json` (stesso NNN del batch),
  un oggetto per ogni id del batch, stesso ordine. Non toccare altri file.
