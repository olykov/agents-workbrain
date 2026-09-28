---
name: workbrain-router
description: Safely route Workbrain Obsidian vault inbox files from `00_inbox/` into a confirmed task workspace or knowledge-base location. Use when the user asks to process, route, inspect, classify, move, or clean up inbox files; when deciding where new meetings, transcripts, chats, wiki exports, logs, alerts, planning docs, or onboarding docs should live; or when preparing a dry-run routing plan before applying file moves.
---

# Workbrain Router

Route Workbrain inbox files conservatively and predictably.

## Required Context

Before acting, read:

1. `AGENTS.md`
2. `01_knowledge_base/00_system/routing_rules.md`
3. `01_knowledge_base/00_system/security_policy.md`
4. `references/vault_schema.md`

Read `references/routing_rules.md` and `references/security_policy.md` only if the canonical KB files are missing or unavailable.

## Modes

Default to `dry_run`.

- `dry_run`: inspect inbox and propose a routing plan; do not modify files.
- `apply`: move files only after explicit user approval.
- `derive`: create summaries, tasks, wiki notes, maps, or analysis only when explicitly requested.
- `audit`: check whether routed files match the vault rules.

## Procedure

1. Inspect `~/workbrain/00_inbox/`.
2. Run `<skill-dir>/scripts/inspect_inbox.py` to get a read-only inventory. Resolve the command
   from this skill directory; do not assume the current working directory is the plugin root.
3. Classify files by type, confidence, target, reason, and risk.
4. Present a routing plan before file changes.
5. Leave low-confidence or sensitive files in `00_inbox/`.
6. Apply moves only after approval.
7. Do not derive content unless explicitly requested.

## Safety

Never delete, overwrite, or edit raw sources.

Never move files outside the vault.

Never commit `00_inbox/`.

Do not create new top-level vault folders unless the user explicitly approves a structure change.

If secrets or credentials are detected, mark `security_review_required` and stop before moving or deriving.

## Output Format

For dry-run, report:

```text
source → target
kind: ...
confidence: high|medium|low
reason: ...
risk: none|security_review_required|needs_user_decision
```

Keep the response short unless the user asks for full details.
