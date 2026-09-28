# Vault Schema

Use this Workbrain vault map when routing inbox files.

```text
00_inbox/                         unprocessed user input, ignored by git
01_knowledge_base/                durable areas, systems, processes and concepts
01_knowledge_base/00_system/      vault rules and templates
02_projects/<project_slug>/project.md  canonical project manifest
02_tasks/<task_slug>/task.md       canonical task card
02_tasks/<task_slug>/sources/      task-specific raw sources
02_tasks/<task_slug>/meetings/     task-specific meetings and transcripts
02_tasks/<task_slug>/evidence/     task-specific evidence
02_tasks/<task_slug>/notes/        task-specific derived notes
99_archive/                        retained inactive material, only when needed
```

Do not route user material into `.git/`, `.obsidian/`, `.codex/`, or `.claude/` unless the user is explicitly changing repository configuration.
