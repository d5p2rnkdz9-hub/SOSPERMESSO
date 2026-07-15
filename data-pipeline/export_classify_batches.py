"""Esporta batch per la classificazione documento → permesso via subagent.

Per ogni record classificabile (has_text o oggetto presente) crea una voce
compatta con metadati + estratto di testo. Scrive data/classify/batch-NNN.json.
I record senza testo né oggetto vengono elencati in data/classify/da-arricchire.json.

Uso:
    python3 export_classify_batches.py [--batch-size 100] [--kb-root PATH]
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
from pathlib import Path

HERE = Path(__file__).parent
CORPUS = HERE / "data" / "corpus.json"
DB_PATH = HERE / "data" / "circolari.db"
OUT_DIR = HERE / "data" / "classify"
DEFAULT_KB_ROOT = Path("~/Desktop/TECH/IMMIGRAZBOT/4_Md_per_knowledge_base_v3").expanduser()

EXCERPT_SCRAPED = 1000
EXCERPT_KB = 700


def kb_excerpt(path: Path, limit: int) -> str:
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return ""
    if text.startswith("---"):
        parts = text.split("---", 2)
        text = parts[2] if len(parts) == 3 else text
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--batch-size", type=int, default=100)
    ap.add_argument("--kb-root", type=Path, default=DEFAULT_KB_ROOT)
    args = ap.parse_args()

    corpus = json.loads(CORPUS.read_text(encoding="utf-8"))

    conn = sqlite3.connect(DB_PATH)
    plain = dict(
        conn.execute(
            "SELECT source || ':' || source_id, testo_plain FROM circolari WHERE testo_plain IS NOT NULL"
        ).fetchall()
    )
    conn.close()

    def scraped_excerpt(rec: dict) -> str:
        key = f"{rec['source_ref']['source']}:{rec['source_ref']['source_id']}"
        text = re.sub(r"\s+", " ", plain.get(key) or "").strip()
        # immigrazione.biz antepone ~500 char di chrome del sito (nav, login, ads):
        # il contenuto vero inizia dopo l'ultimo marker adsense nei primi ~900 char.
        idx = text[:900].rfind("push({});")
        if idx >= 0:
            stripped = text[idx + len("push({});") :].strip()
            if len(stripped) >= 50:  # fallback: non svuotare l'estratto
                text = stripped
        return text[:EXCERPT_SCRAPED]

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for old in OUT_DIR.glob("batch-*.json"):
        old.unlink()

    classifiable, blind = [], []
    for rec in corpus:
        entry = {
            "id": rec["id"],
            "tipo": rec["tipo"],
            "data": rec["data"],
            "ente": rec["ente"],
            "numero": rec["numero"],
            "titolo": rec["titolo"],
            "oggetto": rec["oggetto"],
            "temi": rec["temi"][:8],
        }
        if rec["source_ref"]["kind"] == "kb_md":
            entry["estratto"] = kb_excerpt(args.kb_root / rec["source_ref"]["path"], EXCERPT_KB)
        else:
            entry["estratto"] = scraped_excerpt(rec) if rec["has_text"] else ""

        if entry["estratto"] or entry["oggetto"]:
            classifiable.append(entry)
        else:
            blind.append(rec["id"])

    n = 0
    for i in range(0, len(classifiable), args.batch_size):
        chunk = classifiable[i : i + args.batch_size]
        (OUT_DIR / f"batch-{n:03d}.json").write_text(
            json.dumps(chunk, ensure_ascii=False, indent=1), encoding="utf-8"
        )
        n += 1

    (OUT_DIR / "da-arricchire.json").write_text(
        json.dumps(blind, ensure_ascii=False, indent=1), encoding="utf-8"
    )
    print(f"classificabili: {len(classifiable)} in {n} batch (size {args.batch_size})")
    print(f"da arricchire (senza testo né oggetto): {len(blind)}")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
