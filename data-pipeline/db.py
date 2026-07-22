"""SQLite layer: connessione, schema, insert/upsert."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Optional

SCHEMA = """
CREATE TABLE IF NOT EXISTS circolari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    source_url TEXT NOT NULL,
    titolo TEXT,
    data_pubblicazione TEXT,
    ente_emittente TEXT,
    tipo_documento TEXT,
    numero_protocollo TEXT,
    oggetto TEXT,
    testo_html TEXT,
    testo_plain TEXT,
    pdf_url TEXT,
    included_in_corpus INTEGER NOT NULL DEFAULT 1,
    scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    raw_html TEXT,
    UNIQUE(source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_data ON circolari(data_pubblicazione);
CREATE INDEX IF NOT EXISTS idx_ente ON circolari(ente_emittente);
CREATE INDEX IF NOT EXISTS idx_source ON circolari(source);
CREATE INDEX IF NOT EXISTS idx_tipo ON circolari(tipo_documento);

CREATE TABLE IF NOT EXISTS fetch_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT,
    fetched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_log_status ON fetch_log(status);
"""


DEFAULT_DB_PATH = Path(__file__).parent / "data" / "circolari.db"


@contextmanager
def connect(db_path: Path = DEFAULT_DB_PATH) -> Iterator[sqlite3.Connection]:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    # WAL allows concurrent reads + a single writer (one scraper per source).
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA busy_timeout = 30000")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_schema(db_path: Path = DEFAULT_DB_PATH) -> None:
    with connect(db_path) as conn:
        conn.executescript(SCHEMA)


def already_seen(conn: sqlite3.Connection, source: str, source_id: str) -> bool:
    """Return True if (source, source_id) is in circolari or fetch_log."""
    cur = conn.execute(
        "SELECT 1 FROM circolari WHERE source = ? AND source_id = ? "
        "UNION SELECT 1 FROM fetch_log WHERE source = ? AND source_id = ? LIMIT 1",
        (source, source_id, source, source_id),
    )
    return cur.fetchone() is not None


_INSERT_COLUMNS = [
    "source", "source_id", "source_url",
    "titolo", "data_pubblicazione", "ente_emittente", "tipo_documento",
    "numero_protocollo", "oggetto", "testo_html", "testo_plain", "pdf_url",
    "included_in_corpus", "raw_html",
]


def insert_circolare(conn: sqlite3.Connection, record: dict) -> None:
    # The slim repo DB drops the heavy testo_html / raw_html columns
    # (they only live in the full backup DB) — insert what the table has.
    table_cols = {
        row[1] for row in conn.execute("PRAGMA table_info(circolari)")
    }
    cols = [c for c in _INSERT_COLUMNS if c in table_cols]
    params = {
        "included_in_corpus": 1,
        "tipo_documento": None,
        "numero_protocollo": None,
        "oggetto": None,
        "testo_html": None,
        "testo_plain": None,
        "pdf_url": None,
        "raw_html": None,
        **record,
    }
    conn.execute(
        f"INSERT OR IGNORE INTO circolari ({', '.join(cols)}) "
        f"VALUES ({', '.join(':' + c for c in cols)})",
        {c: params.get(c) for c in cols},
    )


def log_skip(
    conn: sqlite3.Connection,
    source: str,
    source_id: str,
    status: str,
    detail: Optional[str] = None,
) -> None:
    """Persist that (source, source_id) was tried and resulted in not-found / error."""
    conn.execute(
        "INSERT OR REPLACE INTO fetch_log (source, source_id, status, detail) "
        "VALUES (?, ?, ?, ?)",
        (source, source_id, status, detail),
    )


def stats(db_path: Path = DEFAULT_DB_PATH) -> dict:
    with connect(db_path) as conn:
        rows = conn.execute(
            "SELECT source, COUNT(*) AS n FROM circolari GROUP BY source"
        ).fetchall()
        counts = {r["source"]: r["n"] for r in rows}
        logs = conn.execute(
            "SELECT source, status, COUNT(*) AS n FROM fetch_log GROUP BY source, status"
        ).fetchall()
        log_counts = {(r["source"], r["status"]): r["n"] for r in logs}
        return {"circolari": counts, "fetch_log": log_counts}
