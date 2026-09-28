---
name: workbrain-tasks
description: Initialize, create, validate, query, or maintain project and task workspaces in the local Workbrain vault at ~/workbrain. Use for Workbrain setup, project.md, task.md, task lifecycle, task-local raw material, project context, relations, and evidence.
---

# Workbrain Tasks

Work only with the single vault at `~/workbrain`. Resolve the path through the bundled
`scripts/vault.mjs`; do not redirect these scripts to another folder.

## First use

If `~/workbrain/AGENTS.md` is missing, run the bundled `scripts/init-workbrain.mjs` without
`--apply`, show the plan, and apply it only after the user approves. Initialization refuses to
overwrite existing control files.

After initialization, read `AGENTS.md` or `CLAUDE.md` before changing the vault.

## Canonical model

- A project is `02_projects/<slug>/project.md`.
- A task is `02_tasks/<slug>/task.md`.
- Every task has at least one project ID in `projects[]`; membership is not maintained manually in
  a project file.
- Resolve project membership with `scripts/project-context.mjs --project <ID>`.
- Keep task-specific material in `sources/`, `meetings/`, `evidence/`, or `notes/`.
- Keep application code and runtime artifacts outside the vault and link them from the task note.
- Keep raw material unchanged. Read `references/raw-routing.md` before promoting a source into the
  knowledge base.

Read `references/task-schema.json` before creating or validating tasks.

## Progress discipline

- Before material work, identify the relevant task or create one after the user approves the dry-run.
- Keep lifecycle fields and acceptance criteria synchronized with the real state of work.
- Append a dated comment after meaningful progress; never rewrite earlier comments.
- Record evidence, links, outputs, tests or commits that make completion verifiable.
- Before the final response, update the task with what completed, remains pending or became blocked.
- Never mark a task `done` without completion evidence.

## Safety

- Project and task creation are dry-run by default; write only with `--apply` after review.
- Validation and project context are read-only.
- Never delete or rewrite raw material without explicit approval.
- Do not initialize Git, create a remote, push, publish, send or deploy unless the user explicitly
  requests that separate action.

## Commands

Resolve every command from this skill directory; the plugin root is two levels above it.

```bash
node "<skill-dir>/../../scripts/init-workbrain.mjs"
node "<skill-dir>/../../scripts/init-workbrain.mjs" --apply
node "<skill-dir>/../../scripts/project-create.mjs" --id PRJ-DEMO --name "Demo project"
node "<skill-dir>/../../scripts/project-create.mjs" --id PRJ-DEMO --name "Demo project" --apply
node "<skill-dir>/../../scripts/task-create.mjs" --id DEMO-1 --title "First task" --type documentation --projects PRJ-DEMO
node "<skill-dir>/../../scripts/task-create.mjs" --id DEMO-1 --title "First task" --type documentation --projects PRJ-DEMO --apply
node "<skill-dir>/../../scripts/project-context.mjs" --project PRJ-DEMO --format json
node "<skill-dir>/../../scripts/task-validate.mjs" --format text
```

`--projects` accepts comma-separated project IDs. `--type` accepts
`research|discovery|feature|bug-fix|refactor|chore|incident|documentation`. New tasks use
`status: todo`.
