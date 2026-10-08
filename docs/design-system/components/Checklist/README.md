# Checklist

Elenco dei documenti da spuntare nelle sezioni `#primo` e `#rinnovo` delle pagine dei permessi. Lo stato si salva in localStorage con le chiavi `{slug}-primo` / `{slug}-rinnovo`.

- Testata `sp-yellow` con il titolo (Primo rilascio / Rinnovo) e il contatore «2 di 4 pronti» (Poppins 700).
- Sotto, una barra alta 12px su `sp-paper`: il riempimento è `state-success` con un bordo destro `sp-ink`.
- Righe da almeno 56px divise da `sp-rule`. Tutta la riga è un `<label>` cliccabile; la checkbox è da 24px con `accent-color: sp-ink`.
- Un documento spuntato va barrato in `sp-muted`.
- Sotto la lista, i costi (bollettino, marca da bollo) in un riquadro `state-warning-tint`, e il metodo (Kit postale / Questura) come chip.
- Contenitore: `sp-white`, contorno `border-ui`, raggio `radius-lg`, senza ombra (è un'area di lavoro, non un elemento cliccabile).
