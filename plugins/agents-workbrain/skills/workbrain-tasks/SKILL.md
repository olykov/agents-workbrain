---
name: workbrain-tasks
description: Initialize, create, validate, query, close, archive, or maintain project and task workspaces in the local Workbrain vault at ~/workbrain.
---

# Workbrain Tasks

Work only with `~/workbrain`; resolve it through `scripts/vault.mjs`. Read vault `AGENTS.md` before changing it. If missing, show the dry-run from `scripts/init-workbrain.mjs` and apply only after the user approves.

## Model

- Projects: `02_work/<project>/project.md`.
- Active tasks: `02_work/<project>/tasks/<task>/task.md`; unassigned tasks use `_no_project`.
- Individually archived tasks: `archive/<project>/<task>/task.md`.
- Archived project: move its entire directory from `02_work/<project>/` to `archive/<project>/`; preserve every task status. Exclude all archive tasks from open counts.
- A task has one scalar `project:` and optional scalar `parent:`. Find children by ID in both active and archive. Use `project-context.mjs` instead of a manual task list.
- Root IDs use `PREFIX-0001` or a longer numeric sequence; child IDs add `-001`, grandchildren add `-01`. Maximum two child levels. Externally assigned IDs must be real and must not be fabricated.
- Keep task-specific `sources/`, `meetings/`, `notes/`, or `results/` only when needed. Keep code and runtime files outside the vault. Preserve raw material unchanged.

Read `references/task-schema.json` before creating tasks.

## Progress and closure

Append a dated comment after meaningful progress; keep acceptance criteria, status, links, tests and commits aligned with actual work. `Closed` means set status and archive the task folder together. `Cancelled` also archives it; record a reason. `Blocked` stays in the active tree. Do not leave a terminal task in the active tree. An archived project can contain tasks with open statuses; this is not a status rewrite.

At 1000 `task.md` lines and each additional 500 lines, tell the user compression is due and propose the exact scope. After approval, preserve the original history verbatim in `notes/history.md`; summarize older entries in time buckets appropriate to their density (day, week or month). Keep original chronology searchable. Never silently compress or discard comments. Before finishing, update the relevant task with completed, pending and blocked work.

## Safety and commands

Creation is dry-run by default and writes only with `--apply`. Project context and validation are read-only. Do not delete or rewrite raw material without approval. Do not initialize Git, push, publish, send or deploy unless separately requested.

```bash
node "<skill-dir>/../../scripts/init-workbrain.mjs"
node "<skill-dir>/../../scripts/init-workbrain.mjs" --apply
node "<skill-dir>/../../scripts/project-create.mjs" --id PRJ-DEMO --name "Demo project" --apply
node "<skill-dir>/../../scripts/task-create.mjs" --id DEMO-0001 --title "First task" --type documentation --project demo --apply
node "<skill-dir>/../../scripts/task-create.mjs" --title "Child task" --type documentation --project demo --parent DEMO-0001 --apply
node "<skill-dir>/../../scripts/project-context.mjs" --project PRJ-DEMO --format json
node "<skill-dir>/../../scripts/task-validate.mjs" --format text
```
