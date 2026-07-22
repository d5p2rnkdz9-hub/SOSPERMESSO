"""One-off migration: extract testo_plain for permessidisoggiorno.info rows.

permessidisoggiorno.info (an ASP.NET "Normativa.aspx" archive) never inlines the
full circolare/legge/decreto text in the page — it only shows a metadata block
("dati Normativa": Tipo, Numero, Data, Autorità Emittente), a one-line subtitle
between two <hr class="myhr"> tags, an optional Tag list, and a "File Allegati"
table describing the attached PDF (which is fetched via an ASP.NET postback,
not a static URL, so it isn't independently downloadable/parseable here).

So there is no hidden "full body" to recover — the previous parser
(sources/permessidisoggiorno.py `parse()`) only looked for an abstract inside a
<p> tag, which this template never uses, hence testo_plain stayed empty for
~885/888 rows. This script re-parses the FULL backup DB's `raw_html` (present
for all rows, unlike the slim repo DB) with a regex that captures the subtitle
+ attachment description + tags, and composes a metadata-rich testo_plain that
IS actually present on the page, then writes it into the slim `data/circolari.db`
(which has no raw_html column — read-only backup is never modified).

Usage:
    python3 scripts/extract_pds_fulltext.py --dry-run   # sample 20 for review
    python3 scripts/extract_pds_fulltext.py              # write to slim db
"""

from __future__ import annotations

import argparse
import html
import random
import re
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from sources import common  # noqa: E402

BACKUP_DB = Path.home() / "Desktop/TECH/SOSpermesso/BACKUPS/circolari-full-20260715.db"
SLIM_DB = Path(__file__).parent.parent / "data" / "circolari.db"
SOURCE = "permessidisoggiorno.info"

_RE_TITLE_AND_SUB = re.compile(
    r'class="newstitolo">(?P<title>.*?)</span>.*?'
    r'<hr class="myhr"[^>]*/>(?P<sub>.*?)<hr class="myhr"',
    re.S,
)
_RE_LABEL = re.compile(r'class="newslabeldati">([^<]*)</span>')
_RE_VALUE = re.compile(r'class="newsdati">([^<]*)</span>')
_RE_TAGS = re.compile(
    r'lblTags">([^<]*)</span>', re.S
)
_RE_ALLEGATO_DESC = re.compile(
    r"Descrizione Allegato.*?<tr[^>]*>\s*<td[^>]*><font[^>]*>([^<]*)</font></td>",
    re.S,
)


def _clean(text: str | None) -> str | None:
    if text is None:
        return None
    t = common.normalize_ws(html.unescape(text))
    return t or None


def extract(html: str) -> dict:
    """Pull every text fragment actually present on a pds Normativa page."""
    out = {
        "titolo": None,
        "sottotitolo": None,
        "tipo": None,
        "numero": None,
        "data_raw": None,
        "ente": None,
        "tags": None,
        "allegato_desc": None,
    }

    m = _RE_TITLE_AND_SUB.search(html)
    if m:
        out["titolo"] = _clean(m.group("title"))
        out["sottotitolo"] = _clean(m.group("sub"))

    labels = [_clean(x) for x in _RE_LABEL.findall(html)]
    values = [_clean(x) for x in _RE_VALUE.findall(html)]
    label_map: dict[str, str] = {}
    for label, value in zip(labels, values):
        if not label or not value:
            continue
        label_map[label.rstrip(":").strip().lower()] = value

    out["tipo"] = label_map.get("tipo")
    out["numero"] = label_map.get("numero")
    out["data_raw"] = label_map.get("data")
    ente = label_map.get("autorità emittente") or label_map.get("autorita emittente")
    if ente:
        match = common.detect_ente(ente)
        out["ente"] = match or ente

    tag_m = _RE_TAGS.search(html)
    if tag_m:
        out["tags"] = _clean(tag_m.group(1))

    desc_m = _RE_ALLEGATO_DESC.search(html)
    if desc_m:
        out["allegato_desc"] = _clean(desc_m.group(1))

    return out


def compose_testo_plain(fields: dict) -> str | None:
    """Build a readable plain-text summary from every fragment we found.

    This is NOT the full circolare body (that only exists in the linked PDF,
    which the site serves via an ASP.NET postback with no static URL). It's
    the complete set of textual metadata the source page itself carries.
    """
    parts: list[str] = []

    header_bits = [b for b in (fields["tipo"], fields["numero"]) if b]
    header = " ".join(header_bits)
    if fields["data_raw"]:
        header = f"{header} del {fields['data_raw']}".strip()
    if fields["ente"]:
        header = f"{header} — {fields['ente']}".strip(" —")
    if header:
        parts.append(header)

    if fields["titolo"] and fields["titolo"] not in parts[-1:]:
        parts.append(fields["titolo"])

    if fields["sottotitolo"] and fields["sottotitolo"] != fields["titolo"]:
        parts.append(fields["sottotitolo"])

    if fields["allegato_desc"] and fields["allegato_desc"] not in (
        fields["titolo"],
        fields["sottotitolo"],
    ):
        parts.append(f"Allegato: {fields['allegato_desc']}")

    if fields["tags"]:
        parts.append(f"Tag: {fields['tags']}")

    if not parts:
        return None
    return common.normalize_ws(". ".join(parts))


def compose_oggetto(fields: dict) -> str | None:
    """Short abstract — prefer the subtitle line, fall back to titolo."""
    best = fields["sottotitolo"] or fields["titolo"]
    if not best:
        return None
    return best[:400]


def run(dry_run: bool, sample_size: int = 20, seed: int = 42) -> None:
    backup = sqlite3.connect(BACKUP_DB)
    backup.row_factory = sqlite3.Row

    rows = backup.execute(
        "SELECT source_id, raw_html FROM circolari WHERE source = ?", (SOURCE,)
    ).fetchall()
    print(f"Read {len(rows)} {SOURCE} rows with raw_html from backup DB.")

    parsed: dict[str, dict] = {}
    empty = 0
    for row in rows:
        fields = extract(row["raw_html"])
        testo_plain = compose_testo_plain(fields)
        oggetto = compose_oggetto(fields)
        if not testo_plain:
            empty += 1
        parsed[row["source_id"]] = {
            "testo_plain": testo_plain,
            "oggetto": oggetto,
            "ente_emittente": fields["ente"],
            "numero_protocollo": fields["numero"],
            "tipo_documento": fields["tipo"],
        }

    print(f"Parsed: {len(parsed)}  empty testo_plain: {empty}")

    if dry_run:
        random.seed(seed)
        sample_ids = random.sample(list(parsed.keys()), min(sample_size, len(parsed)))
        for sid in sample_ids:
            data = parsed[sid]
            tp = data["testo_plain"] or "<EMPTY>"
            print(f"\n--- source_id={sid} (len={len(tp)}) ---")
            print(tp[:400])
        return

    slim = sqlite3.connect(SLIM_DB)
    updated = 0
    gt500_before = slim.execute(
        "SELECT COUNT(*) FROM circolari WHERE source=? AND length(testo_plain)>500",
        (SOURCE,),
    ).fetchone()[0]
    gt200_before = slim.execute(
        "SELECT COUNT(*) FROM circolari WHERE source=? AND length(testo_plain)>200",
        (SOURCE,),
    ).fetchone()[0]

    for sid, data in parsed.items():
        cur = slim.execute(
            """
            UPDATE circolari
            SET testo_plain = COALESCE(testo_plain, ?),
                oggetto = COALESCE(oggetto, ?),
                ente_emittente = COALESCE(ente_emittente, ?),
                numero_protocollo = COALESCE(numero_protocollo, ?),
                tipo_documento = COALESCE(tipo_documento, ?)
            WHERE source = ? AND source_id = ?
              AND (testo_plain IS NULL OR testo_plain = '')
            """,
            (
                data["testo_plain"],
                data["oggetto"],
                data["ente_emittente"],
                data["numero_protocollo"],
                data["tipo_documento"],
                SOURCE,
                sid,
            ),
        )
        updated += cur.rowcount
    slim.commit()

    gt500_after = slim.execute(
        "SELECT COUNT(*) FROM circolari WHERE source=? AND length(testo_plain)>500",
        (SOURCE,),
    ).fetchone()[0]
    gt200_after = slim.execute(
        "SELECT COUNT(*) FROM circolari WHERE source=? AND length(testo_plain)>200",
        (SOURCE,),
    ).fetchone()[0]

    print(f"\nRows updated: {updated}")
    print(f">200 chars: {gt200_before} -> {gt200_after}")
    print(f">500 chars: {gt500_before} -> {gt500_after}")

    slim.close()
    backup.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Print a sample, don't write")
    ap.add_argument("--sample-size", type=int, default=20)
    args = ap.parse_args()
    run(dry_run=args.dry_run, sample_size=args.sample_size)
