# Vault schema

- `00_inbox/`: unprocessed source material.
- `01_knowledge_base/`: reusable derived knowledge.
- `02_work/<project>/project.md`: active project manifest.
- `02_work/<project>/tasks/<task>/task.md`: active task.
- `02_work/_no_project/tasks/<task>/task.md`: task without a project.
- `archive/<project>/<task>/task.md`: individually closed or cancelled task.
- `archive/<project>/project.md`: whole archived project, possibly with open task statuses.
- Task-local `sources/`, `meetings/`, `notes/` and `results/` are created only when needed.
