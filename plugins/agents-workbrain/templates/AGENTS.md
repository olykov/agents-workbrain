# Workbrain

This folder is a local Workbrain vault for durable agent-assisted work.

- Read this file before changing the vault.
- Projects live at `02_work/<project>/project.md`; active tasks at `02_work/<project>/tasks/<task>/task.md`. Use `_no_project` for tasks without a project.
- `project:` and `parent:` are scalar. Resolve children by ID across `02_work/` and `archive/`; do not maintain a manual list in `project.md`.
- Root task IDs use `PREFIX-0001`; children use `PREFIX-0001-001` and grandchildren `PREFIX-0001-001-01`. Preserve externally assigned numeric IDs; never invent them.
- `Closed` and `Cancelled` task folders belong in `archive/<project>/<task>/`. `Blocked` stays active. An entire project may be archived with task statuses unchanged; archived tasks do not count as open.
- Before material work, find or create the relevant task and read its `task.md`. Keep status, timestamps, acceptance criteria and verifiable results current.
- Append dated progress comments. At 1000 `task.md` lines, then each additional 500 lines, propose history compression to the user. Compress only after approval: preserve the complete original sequence in `notes/history.md` and replace older progress with a time-bucketed summary.
- Before the final response, synchronize the task with completed work, pending work and blockers. Close only with verifiable completion evidence.
- Create task-local `sources/`, `meetings/`, `notes/` and `results/` only when needed. Keep raw files unchanged. Route uncertain material to `00_inbox/` and use a dry-run before moving it.
- Put reusable knowledge in `01_knowledge_base/` only when provenance and ownership are clear. Keep source code and runtime artifacts outside this vault; link confirmed paths from task notes.
- Never delete, overwrite, publish, push, send or deploy without explicit user approval.
- Use `snake_case` for generated folders and filenames.
