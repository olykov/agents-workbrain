#!/usr/bin/env python3
"""Read-only inventory of files in ~/workbrain/00_inbox."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

VAULT = Path.home() / "workbrain"
SECRET_PATTERNS = (
    re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----", re.I),
    re.compile(r"\b(?:api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*['\"]?[^\s'\"]{12,}", re.I),
    re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
)


def arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--format", choices=("json", "markdown"), default="markdown")
    parser.add_argument("--max-bytes", type=int, default=80_000)
    return parser.parse_args()


def classify(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
        return "image"
    if suffix in {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"}:
        return "document"
    if suffix in {".csv", ".tsv", ".json", ".jsonl", ".log"}:
        return "data"
    if suffix in {".md", ".txt"}:
        return "text"
    return "other"


def inspect(max_bytes: int) -> list[dict[str, object]]:
    inbox = VAULT / "00_inbox"
    if not inbox.exists():
        return []
    result = []
    for path in sorted((item for item in inbox.rglob("*") if item.is_file()), key=lambda item: str(item).lower()):
        if any(part.startswith(".") for part in path.relative_to(inbox).parts):
            continue
        sample = path.read_bytes()[:max_bytes].decode("utf-8", errors="replace")
        sensitive = any(pattern.search(sample) for pattern in SECRET_PATTERNS)
        result.append({
            "source": path.relative_to(VAULT).as_posix(),
            "kind": classify(path),
            "bytes": path.stat().st_size,
            "risk": "security_review_required" if sensitive else "none",
        })
    return result


def main() -> None:
    args = arguments()
    files = inspect(args.max_bytes)
    if args.format == "json":
        print(json.dumps({"mode": "read_only", "files": files}, ensure_ascii=False, indent=2))
        return
    print("# Workbrain inbox inventory\n")
    if not files:
        print("Inbox is empty.")
        return
    print("| Source | Kind | Bytes | Risk |")
    print("| --- | --- | ---: | --- |")
    for item in files:
        print(f"| `{item['source']}` | {item['kind']} | {item['bytes']} | {item['risk']} |")


if __name__ == "__main__":
    main()
