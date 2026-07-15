"""Run the end-of-step verification queries from the plan.

Usage:
    python verify.py             # full report
    python verify.py --sample N  # also print N random records for manual spot check
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import db


def report(sample: int = 0) -> dict:
    out: dict = {}
    with db.connect() as conn:
        out["total_per_source"] = {
            r["source"]: r["n"]
            for r in conn.execute(
                "SELECT source, COUNT(*) AS n FROM circolari GROUP BY source"
            )
        }
        out["total"] = sum(out["total_per_source"].values())

        out["nulls"] = {
            "ente_emittente_null": conn.execute(
                "SELECT COUNT(*) FROM circolari WHERE ente_emittente IS NULL"
            ).fetchone()[0],
            "data_pubblicazione_null": conn.execute(
                "SELECT COUNT(*) FROM circolari WHERE data_pubblicazione IS NULL"
            ).fetchone()[0],
            "titolo_null": conn.execute(
                "SELECT COUNT(*) FROM circolari WHERE titolo IS NULL OR titolo = ''"
            ).fetchone()[0],
            "numero_protocollo_null": conn.execute(
                "SELECT COUNT(*) FROM circolari WHERE numero_protocollo IS NULL"
            ).fetchone()[0],
        }
        out["null_pct"] = {
            k: round(100 * v / max(out["total"], 1), 1) for k, v in out["nulls"].items()
        }

        row = conn.execute(
            "SELECT MIN(data_pubblicazione) AS min_d, MAX(data_pubblicazione) AS max_d "
            "FROM circolari WHERE data_pubblicazione IS NOT NULL"
        ).fetchone()
        out["date_range"] = {"min": row["min_d"], "max": row["max_d"]}

        out["by_year"] = [
            {"year": r["y"], "n": r["n"]}
            for r in conn.execute(
                "SELECT substr(data_pubblicazione, 1, 4) AS y, COUNT(*) AS n "
                "FROM circolari WHERE data_pubblicazione IS NOT NULL "
                "GROUP BY y ORDER BY y"
            )
        ]

        out["top_enti"] = [
            {"ente": r["ente_emittente"], "n": r["n"]}
            for r in conn.execute(
                "SELECT ente_emittente, COUNT(*) AS n FROM circolari "
                "WHERE ente_emittente IS NOT NULL GROUP BY ente_emittente "
                "ORDER BY n DESC LIMIT 15"
            )
        ]

        out["by_tipo"] = [
            {"tipo": r["tipo_documento"], "n": r["n"], "in_corpus": r["in_corpus"]}
            for r in conn.execute(
                "SELECT tipo_documento, included_in_corpus AS in_corpus, COUNT(*) AS n "
                "FROM circolari GROUP BY tipo_documento, in_corpus "
                "ORDER BY n DESC"
            )
        ]

        out["fetch_log"] = [
            {"source": r["source"], "status": r["status"], "n": r["n"]}
            for r in conn.execute(
                "SELECT source, status, COUNT(*) AS n FROM fetch_log "
                "GROUP BY source, status ORDER BY source, status"
            )
        ]

        out["included_in_corpus"] = conn.execute(
            "SELECT COUNT(*) FROM circolari WHERE included_in_corpus = 1"
        ).fetchone()[0]

        if sample > 0:
            out["sample"] = [
                {
                    "source": r["source"],
                    "source_id": r["source_id"],
                    "source_url": r["source_url"],
                    "titolo": r["titolo"],
                    "data": r["data_pubblicazione"],
                    "ente": r["ente_emittente"],
                    "tipo": r["tipo_documento"],
                    "proto": r["numero_protocollo"],
                }
                for r in conn.execute(
                    "SELECT * FROM circolari WHERE included_in_corpus = 1 "
                    "ORDER BY random() LIMIT ?",
                    (sample,),
                )
            ]

    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--sample", type=int, default=0)
    parser.add_argument("--json", action="store_true", help="JSON output instead of text")
    args = parser.parse_args()

    r = report(sample=args.sample)

    if args.json:
        print(json.dumps(r, indent=2, ensure_ascii=False))
        return 0

    print("=== TOTALS ===")
    print(f"Total records: {r['total']}")
    for src, n in r["total_per_source"].items():
        print(f"  {src}: {n}")
    print(f"In-corpus (Circolari + Note + simili): {r['included_in_corpus']}")
    print()

    print("=== METADATA QUALITY ===")
    for key, n in r["nulls"].items():
        pct = r["null_pct"][key]
        print(f"  {key}: {n} ({pct}%)")
    print()
    print(f"  Date range: {r['date_range']['min']} → {r['date_range']['max']}")
    print()

    print("=== BY YEAR ===")
    for row in r["by_year"]:
        print(f"  {row['year']}: {row['n']}")
    print()

    print("=== TOP ENTI ===")
    for row in r["top_enti"]:
        print(f"  {row['n']:>4}  {row['ente']}")
    print()

    print("=== BY TIPO ===")
    for row in r["by_tipo"]:
        flag = "✓" if row["in_corpus"] == 1 else "✗"
        print(f"  {flag} {row['tipo']}: {row['n']}")
    print()

    print("=== FETCH LOG (skipped / not-found) ===")
    for row in r["fetch_log"]:
        print(f"  {row['source']} / {row['status']}: {row['n']}")

    if "sample" in r:
        print()
        print(f"=== RANDOM SAMPLE ({len(r['sample'])} records) ===")
        for s in r["sample"]:
            print(f"  [{s['source']}#{s['source_id']}] {s['data']}  {s['tipo']}  {s['ente']}")
            print(f"    {s['titolo'][:90]}")
            print(f"    {s['source_url']}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
