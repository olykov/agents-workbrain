# Agents Workbrain

Agents Workbrain is a private-first plugin for keeping long-running work understandable to both
people and local agents. It creates one Markdown vault at `~/workbrain` with projects, task
workspaces, source material, evidence, notes, and reusable knowledge.

The plugin works with Codex and Claude Code. Obsidian is optional: it is a convenient interface for
the vault, while the files remain ordinary Markdown.

## What it includes

- `workbrain-tasks`: initialize the vault, create projects and tasks, validate metadata, and load
  project context.
- `workbrain-router`: inspect `00_inbox/` and propose safe destinations before moving raw files.
- four cross-host hooks: `SessionStart` loads vault discipline, `PostToolUse` notices material
  changes, `Stop` reminds the agent to synchronize the task before finishing, and `SessionEnd`
  clears session-local hook state.
- small Node.js and Python scripts with no third-party runtime dependencies.

It contains only the clean-vault workflow. Project-specific processors, MCP servers, credentials,
and machine-specific paths stay outside the package.

## Install

Both hosts need Git access to this repository.

### Codex

```bash
codex plugin marketplace add OWNER/agents-workbrain
```

Then install `agents-workbrain` from the plugin directory in ChatGPT Work or Codex. Review and trust
the bundled hook when prompted; plugin hooks are not trusted automatically.

### Claude Code

```text
/plugin marketplace add OWNER/agents-workbrain
/plugin install agents-workbrain@agents-workbrain
```

Replace `OWNER` with the GitHub account or organization that hosts the repository. Start a new
session after installation.

## First run

Ask the agent:

> Initialize my Workbrain vault. Show the dry-run first and wait for approval before applying it.

The initializer creates:

```text
~/workbrain/
├── AGENTS.md
├── CLAUDE.md -> AGENTS.md
├── 00_inbox/
├── 01_knowledge_base/00_system/
├── 02_projects/
├── 02_tasks/
└── 99_archive/
```

Next, ask it to create one project and one real task. Creation commands are dry-run by default and
write only with `--apply` after review.

## Optional Obsidian interface

The agent should offer [Obsidian from the official download page](https://obsidian.md/download) as
an optional visual interface. After installation, open the existing `~/workbrain` folder as an
Obsidian vault; do not create a second vault or move the files.

For a visual project and task board, optionally install
[Agents Workbrain Kanban](https://github.com/olykov/agents-workbrains-obsidian-plugin). It reads and
updates the same canonical Markdown files; Agents Workbrain does not require it.

## Clean-install test prompt

Use this prompt from a clean macOS account:

> Install Agents Workbrain from `https://github.com/olykov/agents-workbrain`. Show the dry-run,
> initialize the single vault at `~/workbrain` after approval, and create one project with one real
> task. Perform a small file-based task, record its status, acceptance criteria, evidence, and a
> dated progress comment, then validate the task. Start a new session and confirm that the Workbrain
> context is loaded again. Offer the official Obsidian app as an optional interface, explain how to
> open `~/workbrain` as an existing vault, and offer the optional Agents Workbrain Kanban plugin
> linked in this README.

## Direct commands

Run these from `plugins/agents-workbrain`:

```bash
node scripts/init-workbrain.mjs
node scripts/init-workbrain.mjs --apply
node scripts/project-create.mjs --id PRJ-DEMO --name "Demo project" --apply
node scripts/task-create.mjs --id DEMO-1 --title "First task" --type documentation --projects PRJ-DEMO --apply
node scripts/project-context.mjs --project PRJ-DEMO --format json
node scripts/task-validate.mjs --format text
python3 skills/workbrain-router/scripts/inspect_inbox.py --format json
```

## Safety model

- One fixed vault: `~/workbrain`.
- Dry-run before initialization, project creation, task creation, or routing changes.
- Never overwrite control files or existing task manifests.
- Raw inputs remain unchanged unless the user explicitly approves a move.
- Hooks provide context; they are not a security boundary.
- `AGENTS.md` is installed at the vault root and requires agents to keep task lifecycle, acceptance
  criteria, evidence, and append-only progress comments synchronized with real work.
- Code and runtime artifacts stay outside the vault and are linked from task notes when needed.

## Development checks

```bash
node plugins/agents-workbrain/tests/smoke.mjs
python3 /path/to/plugin-creator/scripts/validate_plugin.py plugins/agents-workbrain
claude plugin validate plugins/agents-workbrain --strict
```

## License

MIT
