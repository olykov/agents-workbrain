# Workbrain

A portable Markdown vault for projects, tasks and reusable knowledge.

```text
00_inbox/                           Unprocessed input
01_knowledge_base/00_system/        Routing and security rules
02_work/<project>/project.md        Project manifest
02_work/<project>/tasks/<task>/     Active task folder
02_work/_no_project/tasks/<task>/   Task without a project
archive/<project>/<task>/           Individually archived task
archive/<project>/project.md        Archived whole project
```

Use `project-context.mjs` to view project membership. Children are resolved from `parent:` across active and archived tasks. Task-local `sources/`, `meetings/`, `notes/` and `results/` are optional. Code stays outside this vault.
