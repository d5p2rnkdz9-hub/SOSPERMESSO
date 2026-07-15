"""Consolida le fonti in un corpus unificato.

Unisce:
  1. data/circolari.db          (2.157 circolari scrapate: immigrazione.biz + permessidisoggiorno.info)
  2. IMMIGRAZBOT KB v3          (~2.181 MD con frontmatter YAML: giurisprudenza, prassi, dottrina, normativa)

Output: data/corpus.json — un record per documento, schema unificato:
  id, origine, tipo, tipo_dettaglio, data, ente, numero, titolo, oggetto,
  temi[], permessi[] (vuoto, riempito dalla classificazione), esito,
  url, pdf_url, has_text, source_ref

Uso:
    python3 consolidate.py [--kb-root PATH]
"""

from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from collections import Counter
from pathlib import Path

import yaml

HERE = Path(__file__).parent
DB_PATH = HERE / "data" / "circolari.db"
OUT_PATH = HERE / "data" / "corpus.json"
DEFAULT_KB_ROOT = Path("~/Desktop/TECH/IMMIGRAZBOT/4_Md_per_knowledge_base_v3").expanduser()

SOURCE_PREFIX = {"immigrazione.biz": "biz", "permessidisoggiorno.info": "pds"}


def norm_tipo(raw: str | None) -> str:
    if not raw:
        return "altro"
    t = raw.strip().lower()
    aliases = {
        "circolare": "circolare", "nota": "nota", "decreto": "decreto",
        "messaggio": "messaggio", "comunicato": "comunicato", "parere": "parere",
        "direttiva": "direttiva", "ordinanza": "ordinanza", "sentenza": "sentenza",
        "legge": "normativa", "d.lgs.": "normativa", "dpcm": "decreto",
    }
    for k, v in aliases.items():
        if t.startswith(k):
            return v
    return t


def norm_date(raw) -> str | None:
    """Ritorna YYYY-MM-DD o None."""
    if raw is None:
        return None
    s = str(raw).strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", s):
        return s
    if re.fullmatch(r"\d{4}", s):
        return f"{s}-01-01"
    m = re.fullmatch(r"(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})", s)
    if m:
        return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"
    return None


def clean_title(filename: str) -> str:
    t = re.sub(r"\.(md|pdf|docx?)$", "", filename, flags=re.I)
    t = re.sub(r"\s+(OK|ok|Ok|def)\s*$", "", t)
    t = re.sub(r"[_]+", " ", t)
    return re.sub(r"\s{2,}", " ", t).strip()


def load_circolari() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM circolari").fetchall()
    conn.close()
    out = []
    for r in rows:
        prefix = SOURCE_PREFIX.get(r["source"], r["source"])
        text = r["testo_plain"] or ""
        out.append({
            "id": f"{prefix}:{r['source_id']}",
            "origine": r["source"],
            "tipo": norm_tipo(r["tipo_documento"]),
            "tipo_dettaglio": r["tipo_documento"],
            "data": norm_date(r["data_pubblicazione"]),
            "ente": r["ente_emittente"] or None,
            "numero": r["numero_protocollo"] or None,
            "titolo": r["titolo"] or "",
            "oggetto": r["oggetto"] or None,
            "temi": [],
            "permessi": [],
            "esito": None,
            "url": r["source_url"],
            "pdf_url": r["pdf_url"] or None,
            "has_text": len(text) > 200,
            "included_in_corpus": bool(r["included_in_corpus"]),
            "source_ref": {"kind": "sqlite", "source": r["source"], "source_id": r["source_id"]},
        })
    return out


KB_TIPO = {
    "giurisprudenza": "sentenza",
    "estratto_sentenza": "sentenza",
    "prassi": "prassi",
    "dottrina": "dottrina",
    "normativa": "normativa",
    "altro": "altro",
}


def load_kb(kb_root: Path) -> tuple[list[dict], int]:
    out, errors = [], 0
    for p in sorted(kb_root.rglob("*.md")):
        rel = p.relative_to(kb_root).as_posix()
        try:
            text = p.read_text(encoding="utf-8")
            if not text.startswith("---"):
                errors += 1
                continue
            fm = yaml.safe_load(text.split("---", 2)[1])
            if not isinstance(fm, dict):
                errors += 1
                continue
        except Exception:
            errors += 1
            continue

        legal_issue = fm.get("legal_issue")
        if isinstance(legal_issue, dict):
            oggetto = legal_issue.get("main")
        else:
            oggetto = legal_issue if isinstance(legal_issue, str) else None

        temi = []
        if fm.get("chatbot_id"):
            temi.append(str(fm["chatbot_id"]))
        tags = fm.get("tags")
        if isinstance(tags, list):
            temi.extend(str(t) for t in tags[:10])

        doc_type = fm.get("document_type") or "altro"
        # subcategory 'circolare' dentro prassi va tipizzata come circolare
        sub = fm.get("subcategory") or None
        tipo = "circolare" if sub == "circolare" else KB_TIPO.get(doc_type, "altro")

        out.append({
            "id": f"kb:{rel}",
            "origine": "immigrazbot",
            "tipo": tipo,
            "tipo_dettaglio": sub or doc_type,
            "data": norm_date(fm.get("date")),
            "ente": fm.get("court") or None,
            "numero": str(fm.get("case_number")) if fm.get("case_number") else None,
            "titolo": clean_title(fm.get("filename_original") or p.stem),
            "oggetto": oggetto,
            "temi": temi,
            "permessi": [],
            "esito": fm.get("favorable_to") or None,
            "url": fm.get("gdrive_url") or None,
            "pdf_url": None,
            "has_text": True,
            "included_in_corpus": True,
            "source_ref": {"kind": "kb_md", "path": rel},
        })
    return out, errors


def dedup_key(rec: dict) -> tuple | None:
    """Chiave debole per segnalare probabili duplicati cross-fonte (no merge)."""
    if rec["numero"] and rec["data"]:
        num = re.sub(r"\D", "", rec["numero"])
        if num:
            return (num, rec["data"])
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--kb-root", type=Path, default=DEFAULT_KB_ROOT)
    args = ap.parse_args()

    circolari = load_circolari()
    kb, kb_errors = load_kb(args.kb_root) if args.kb_root.exists() else ([], -1)
    if kb_errors == -1:
        print(f"ATTENZIONE: KB root non trovata: {args.kb_root} — corpus solo circolari", file=sys.stderr)

    corpus = circolari + kb

    seen: dict[tuple, str] = {}
    dup_count = 0
    for rec in corpus:
        k = dedup_key(rec)
        if k is None:
            continue
        if k in seen and not rec["id"].startswith(seen[k].split(":")[0]):
            rec["dup_of"] = seen[k]
            dup_count += 1
        else:
            seen.setdefault(k, rec["id"])

    OUT_PATH.write_text(json.dumps(corpus, ensure_ascii=False, indent=1), encoding="utf-8")

    tipi = Counter(r["tipo"] for r in corpus)
    origini = Counter(r["origine"] for r in corpus)
    print(f"corpus: {len(corpus)} record → {OUT_PATH}")
    print(f"  origini: {dict(origini)}")
    print(f"  tipi: {dict(tipi.most_common())}")
    print(f"  con testo: {sum(r['has_text'] for r in corpus)}")
    print(f"  probabili duplicati cross-fonte: {dup_count}")
    if kb_errors > 0:
        print(f"  frontmatter KB illeggibili: {kb_errors}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
