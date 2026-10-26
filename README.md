# Agents Workbrain

Agents Workbrain keeps long-running work in a portable Markdown vault at `~/workbrain`. Codex and Claude Code can read the same files. Obsidian and [Agents Workbrain Kanban](https://github.com/olykov/agents-workbrains-obsidian-plugin) are optional interfaces.

## Layout

```text
~/workbrain/
├── AGENTS.md
├── CLAUDE.md -> AGENTS.md
├── 00_inbox/
├── 01_knowledge_base/00_system/
├── 02_work/
│   ├── _no_project/tasks/
│   └── demo/
│       ├── project.md
│       └── tasks/demo_0001/task.md
└── archive/
```

Each task belongs to one physical project folder and has scalar `project:` and `parent:` fields. Root IDs use `DEMO-0001`; children use `DEMO-0001-001`, and grandchildren use `DEMO-0001-001-01`. `Closed` and `Cancelled` tasks move to `archive/<project>/<task>/`; `Blocked` tasks remain active. A whole project can be archived with its task statuses unchanged. Archived tasks do not count as open. Task-local `sources/`, `meetings/`, `notes/` and `results/` are created only when useful.

The vault keeps task-specific material and links to code workspaces; application code stays outside it. Raw input is preserved until a move is explicitly approved. At 1000 lines of task history, then each additional 500 lines, the agent proposes compression. It runs only after approval and retains the verbatim original in `notes/history.md`.

## Install

```bash
codex plugin marketplace add olykov/agents-workbrain
```

Install `agents-workbrain` from the plugin directory. For Claude Code:

```text
/plugin marketplace add olykov/agents-workbrain
/plugin install agents-workbrain@agents-workbrain
```

Review the bundled hooks when prompted. Start a new session after installation. Open the existing `~/workbrain` directory in Obsidian if you want a visual interface; no second vault or board file is needed.

## Direct commands

Run from `plugins/agents-workbrain`. Creation is dry-run by default; `--apply` writes after review.

```bash
node scripts/init-workbrain.mjs
node scripts/init-workbrain.mjs --apply
node scripts/project-create.mjs --id PRJ-DEMO --name "Demo project" --slug demo --apply
node scripts/task-create.mjs --id DEMO-0001 --title "First task" --type documentation --project demo --apply
node scripts/task-create.mjs --title "Child task" --type documentation --project demo --parent DEMO-0001 --apply
node scripts/project-context.mjs --project PRJ-DEMO --format json
node scripts/task-validate.mjs --format text
```

`workbrain-tasks` covers task creation, validation and lifecycle. `workbrain-router` inventories `00_inbox/` and proposes safe destinations. Hooks load vault context and remind the agent to synchronize material task progress. No third-party runtime dependency is required for the scripts.

## Demo and checks

Run `node plugins/agents-workbrain/tests/smoke.mjs` for an isolated temporary-vault demo. It initializes a vault, creates a project and task, checks project context and validation, and exercises the progress hook. `node plugins/agents-workbrain/tests/demo.mjs` adds the two child levels and an archived task, then prints a generic tree. Both remove their temporary vault afterward. Use `node plugins/agents-workbrain/tests/demo.mjs --keep` to retain the sample vault for opening in Obsidian; the printed path is a temporary folder you can remove after inspection.

This is a v2 layout. Existing v1 vaults need an explicit migration; the initializer refuses to overwrite existing control files. The optional Kanban plugin must use v0.2 or later for this layout.

## License

MIT
