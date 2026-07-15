"""CLI entrypoint for data-pipeline scrapers.

Usage:
    python cli.py init
    python cli.py scrape immigrazione_biz --start 1 --end 1300
    python cli.py scrape permessidisoggiorno --start 1 --end 1500
    python cli.py stats
"""

from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

import db
from sources import common, immigrazione_biz, permessidisoggiorno

SCRAPERS = {
    "immigrazione_biz": immigrazione_biz,
    "permessidisoggiorno": permessidisoggiorno,
}


def cmd_init(_args) -> int:
    db.init_schema()
    print(f"Schema initialized at {db.DEFAULT_DB_PATH}")
    return 0


def cmd_scrape(args) -> int:
    scraper = SCRAPERS.get(args.source)
    if scraper is None:
        print(f"Unknown source: {args.source}. Choices: {list(SCRAPERS)}", file=sys.stderr)
        return 2

    db.init_schema()
    limiter = common.RateLimiter(delay=args.delay)
    started = time.monotonic()

    def on_progress(sid: int, outcome: str, counters: dict) -> None:
        if sid % 25 == 0 or outcome == "error":
            elapsed = time.monotonic() - started
            print(
                f"[{args.source}] id={sid} {outcome}  "
                f"saved={counters['saved']} "
                f"not_found={counters.get('not_found',0)} "
                f"filtered={counters.get('filtered',0)} "
                f"errors={counters['errors']} "
                f"skipped={counters['skipped']} "
                f"elapsed={elapsed:.1f}s",
                flush=True,
            )

    with common.make_client() as client, db.connect() as conn:
        counters = scraper.scrape_range(
            conn,
            client,
            limiter,
            args.start,
            args.end,
            insert_fn=db.insert_circolare,
            log_fn=db.log_skip,
            already_seen_fn=db.already_seen,
            on_progress=on_progress,
        )

    print(f"\nDone: {counters}")
    return 0


def cmd_stats(_args) -> int:
    s = db.stats()
    print("Circolari per source:")
    for src, n in sorted(s["circolari"].items()):
        print(f"  {src}: {n}")
    print("\nFetch log status:")
    for (src, status), n in sorted(s["fetch_log"].items()):
        print(f"  {src} / {status}: {n}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SOSPermesso data-pipeline CLI")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init", help="Initialize SQLite schema")

    sp = sub.add_parser("scrape", help="Run a scraper over an id range")
    sp.add_argument("source", choices=list(SCRAPERS))
    sp.add_argument("--start", type=int, required=True)
    sp.add_argument("--end", type=int, required=True)
    sp.add_argument("--delay", type=float, default=1.0, help="Seconds between requests")

    sub.add_parser("stats", help="Print row counts per source")

    args = parser.parse_args(argv)

    if args.cmd == "init":
        return cmd_init(args)
    if args.cmd == "scrape":
        return cmd_scrape(args)
    if args.cmd == "stats":
        return cmd_stats(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
