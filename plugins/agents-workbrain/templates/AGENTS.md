# Workbrain

This folder is a local Workbrain vault for durable agent-assisted work.

- Read this file before changing the vault.
- Projects live at `02_projects/<slug>/project.md`.
- Tasks live at `02_tasks/<slug>/task.md` and belong to one or more projects through `projects[]`.
- Before material work, find or create the relevant task and read its `task.md`.
- Keep task state current while working: update `status`, `updated`, `start_date` and `finish_date` when their lifecycle changes.
- Check completed acceptance criteria and record useful evidence, links, tests, outputs or commits in the task.
- Append a dated progress comment after meaningful work. Comments are append-only; never rewrite earlier entries.
- Before the final response, synchronize the task with what was actually completed, left pending or blocked.
- Do not mark a task `done` without verifiable completion evidence.
- Put task-specific source material in `sources/`, meetings in `meetings/`, evidence in `evidence/`, and working notes in `notes/`.
- Keep raw files unchanged. Route uncertain material to `00_inbox/` and use a dry-run before moving it.
- Put reusable knowledge in `01_knowledge_base/` only when provenance and ownership are clear.
- Keep source code and runtime artifacts outside this vault; link their paths from task metadata.
- Never delete, overwrite, publish, push, send, or deploy without explicit user approval.
- Use `snake_case` for generated folders and filenames.
