"""Unisce gli output dei subagent di classificazione in data/classificazione.json.

Valida: copertura 1:1 con i batch, slug ammessi (da PROMPT.md), schema.
I documenti senza testo né oggetto (da-arricchire.json) entrano con status
"da_arricchire". Segnala batch mancanti senza fallire.

Uso:
    python3 merge_classification.py
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).parent
CDIR = HERE / "data" / "classify"
OUT = HERE / "data" / "classificazione.json"


def valid_slugs() -> set[str]:
    slugs = set()
    for line in (CDIR / "PROMPT.md").read_text(encoding="utf-8").splitlines():
        m = re.match(r"\|\s*([a-z0-9-]+)\s*\|", line)
        if m and m.group(1) not in {"slug"}:
            slugs.add(m.group(1))
    return slugs


def main() -> int:
    slugs = valid_slugs()
    result: dict[str, dict] = {}
    problems: list[str] = []
    missing_batches: list[str] = []

    for batch_path in sorted(CDIR.glob("batch-*.json")):
        n = batch_path.stem.split("-")[1]
        out_path = CDIR / f"out-{n}.json"
        batch = json.loads(batch_path.read_text(encoding="utf-8"))
        if not out_path.exists():
            missing_batches.append(n)
            continue
        try:
            out = json.loads(out_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            problems.append(f"out-{n}: JSON invalido ({e})")
            continue

        got = {o.get("id"): o for o in out if isinstance(o, dict)}
        for rec in batch:
            o = got.get(rec["id"])
            if o is None:
                problems.append(f"out-{n}: manca id {rec['id']}")
                continue
            perms = []
            for p in o.get("permessi") or []:
                if not isinstance(p, dict) or p.get("slug") not in slugs:
                    problems.append(f"out-{n}: slug invalido {p} per {rec['id']}")
                    continue
                ril = p.get("rilevanza")
                perms.append({"slug": p["slug"], "rilevanza": ril if ril in (1, 2, 3) else 1})
            result[rec["id"]] = {
                "permessi": perms,
                "trasversale": bool(o.get("trasversale")),
                "fuori_ambito": bool(o.get("fuori_ambito")),
                "tema": str(o.get("tema") or "")[:80],
                "status": "classificato",
            }

    blind_path = CDIR / "da-arricchire.json"
    if blind_path.exists():
        for rid in json.loads(blind_path.read_text(encoding="utf-8")):
            result.setdefault(rid, {"permessi": [], "trasversale": False,
                                    "fuori_ambito": False, "tema": "",
                                    "status": "da_arricchire"})

    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")

    classified = [r for r in result.values() if r["status"] == "classificato"]
    with_perm = [r for r in classified if r["permessi"]]
    slug_count = Counter(p["slug"] for r in with_perm for p in r["permessi"])
    print(f"classificazione.json: {len(result)} record "
          f"({len(classified)} classificati, {len(result)-len(classified)} da arricchire)")
    print(f"  con permessi: {len(with_perm)} | trasversali: {sum(r['trasversale'] for r in classified)}"
          f" | fuori ambito: {sum(r['fuori_ambito'] for r in classified)}")
    print("  top permessi:", slug_count.most_common(10))
    if missing_batches:
        print(f"  BATCH MANCANTI ({len(missing_batches)}): {missing_batches}")
    if problems:
        print(f"  PROBLEMI ({len(problems)}):")
        for p in problems[:20]:
            print("   -", p)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
