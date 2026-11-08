#!/usr/bin/env python3
"""
Esporta l'INTERO corpus del SQLite (entrambe le fonti, tutti i tipi di documento)
per l'area PRO dell'app: ../app/.cache/circolari-pro.json, poi importato in Neon
da `node scripts/import-circolari.mjs` (repo app).

Riusa pulizia, paragrafazione, normalizzazione ente e titolo di
export_circolari_site.py: ogni fix al testo va fatto lì, non qui.

  python3 data-pipeline/export_circolari_pro.py
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from export_circolari_site import (
    CLASSIFICAZIONE_PATH,
    DB_PATH,
    build_titolo_pubblico,
    clean_body,
    fix_mojibake,
    format_date_it,
    load_meta_overrides,
    norm_date,
    normalize_ente,
    paragraphize,
)

OUT_PATH = Path(__file__).resolve().parent.parent.parent / "app" / ".cache" / "circolari-pro.json"
MIN_TEXT = 200

SOURCE_PREFIX = {"immigrazione.biz": "biz", "permessidisoggiorno.info": "pds"}


def permessi_slugs(raw: list) -> list[str]:
    """classificazione.json: lista di {"slug", "rilevanza" 1-3} (o stringhe): solo slug, i più rilevanti prima."""
    items = []
    for p in raw or []:
        if isinstance(p, str):
            items.append((2, p))
        elif isinstance(p, dict) and p.get("slug"):
            items.append((int(p.get("rilevanza") or 2), p["slug"]))
    seen, out = set(), []
    for _, slug in sorted(items, key=lambda t: -t[0]):
        if slug not in seen:
            seen.add(slug)
            out.append(slug)
    return out


def main() -> int:
    classificazione = json.loads(CLASSIFICAZIONE_PATH.read_text(encoding="utf-8")) if CLASSIFICAZIONE_PATH.exists() else {}
    overrides = load_meta_overrides()

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(
        "SELECT source, source_id, source_url, pdf_url, tipo_documento, titolo, ente_emittente, "
        "numero_protocollo, data_pubblicazione, oggetto, testo_plain FROM circolari ORDER BY source, id"
    ).fetchall()
    conn.close()

    records, skipped = [], 0
    for row in rows:
        prefix = SOURCE_PREFIX.get(row["source"])
        if not prefix:
            continue
        key = f"{prefix}:{row['source_id']}"
        body = clean_body(row["testo_plain"])
        if len(body) < MIN_TEXT:
            skipped += 1
            continue
        override = overrides.get(key, {}) if prefix == "biz" else {}
        classif = classificazione.get(key, {}) if prefix == "biz" else {}

        ente = normalize_ente(fix_mojibake(override.get("ente") or row["ente_emittente"]))
        if ente:
            ente = ente.replace("_", " ").strip()  # "TAR_Lazio" (fonte pds)
        numero = override.get("numero") or row["numero_protocollo"]
        oggetto = fix_mojibake(override.get("oggetto") or row["oggetto"])
        data_iso = norm_date(row["data_pubblicazione"])
        tipo = (row["tipo_documento"] or "Circolare").strip()
        tipo = tipo[:1].upper() + tipo[1:]  # "nota" → "Nota"

        titolo = build_titolo_pubblico(ente, numero, format_date_it(data_iso), oggetto)
        if tipo.lower() != "circolare":
            titolo = titolo.replace("Circolare", tipo, 1)

        paragrafi = paragraphize(body)
        records.append({
            "id": key,
            "fonte": row["source"],
            "slug_pubblico": f"circolare-{row['source_id']}" if prefix == "biz" else None,
            "source_url": row["source_url"],
            "pdf_url": row["pdf_url"],
            "tipo": tipo,
            "ente": ente or None,
            "numero": numero or None,
            "data": data_iso,
            "titolo": titolo,
            "oggetto": oggetto or None,
            "tema": classif.get("tema") or None,
            "permessi": permessi_slugs(classif.get("permessi", [])),
            "trasversale": bool(classif.get("trasversale", False)),
            "fuori_ambito": bool(classif.get("fuori_ambito", False)),
            "testo": paragrafi,
        })

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(records, ensure_ascii=False), encoding="utf-8")
    print(f"[export_circolari_pro] {len(records)} documenti scritti in {OUT_PATH} ({skipped} senza testo saltati)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
