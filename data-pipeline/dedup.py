"""Cross-source deduplication.

A circolare can be aggregated by both immigrazione.biz and permessidisoggiorno.info.
We compute a canonical hash from (ente, numero, date) and write it back to the
`hash_canonico` column. Records sharing the same hash are duplicates of the same
underlying circolare. Sister-source URLs are accessible via a simple SQL query —
no extra junction table needed at this volume.
"""

from __future__ import annotations

import hashlib

import db
from sources import common


def _compute_hash(ente: str | None, numero: str | None, data: str | None, titolo: str | None) -> str | None:
    """Return canonical sha1 for dedup, or None if not enough metadata."""
    if numero and data:
        key = (
            common.normalize_for_hash(ente)
            + "|"
            + common.normalize_for_hash(numero)
            + "|"
            + (data or "")
        )
        return hashlib.sha1(key.encode("utf-8")).hexdigest()
    if titolo and data:
        key = common.normalize_for_hash(titolo) + "|" + data
        return hashlib.sha1(key.encode("utf-8")).hexdigest()
    return None


def ensure_column() -> None:
    """Idempotent ALTER TABLE to add hash_canonico if missing."""
    with db.connect() as conn:
        cols = {r[1] for r in conn.execute("PRAGMA table_info(circolari)")}
        if "hash_canonico" not in cols:
            conn.execute("ALTER TABLE circolari ADD COLUMN hash_canonico TEXT")
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_hash_canonico ON circolari(hash_canonico)"
            )


def run() -> dict:
    ensure_column()
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT id, ente_emittente, numero_protocollo, data_pubblicazione, titolo "
            "FROM circolari"
        ).fetchall()

        updated = 0
        skipped = 0
        for r in rows:
            h = _compute_hash(
                r["ente_emittente"], r["numero_protocollo"], r["data_pubblicazione"], r["titolo"]
            )
            if h is None:
                skipped += 1
                continue
            conn.execute(
                "UPDATE circolari SET hash_canonico = ? WHERE id = ?", (h, r["id"])
            )
            updated += 1
        conn.commit()

        dup_groups = conn.execute(
            """
            SELECT hash_canonico, COUNT(*) AS n, GROUP_CONCAT(source || ':' || source_id) AS members
            FROM circolari
            WHERE hash_canonico IS NOT NULL
            GROUP BY hash_canonico
            HAVING n > 1
            ORDER BY n DESC, hash_canonico
            """
        ).fetchall()

    return {
        "updated": updated,
        "skipped_no_hash": skipped,
        "duplicate_groups": len(dup_groups),
        "duplicate_records": sum(r["n"] for r in dup_groups),
        "sample": [dict(r) for r in dup_groups[:10]],
    }


if __name__ == "__main__":
    import json

    summary = run()
    print(json.dumps(summary, indent=2, ensure_ascii=False))
