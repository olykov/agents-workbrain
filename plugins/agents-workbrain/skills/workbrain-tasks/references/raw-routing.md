# Raw routing policy

Keep raw in its task when it is task-specific, contains historical context, or has no confirmed second consumer. Store it under `sources/` or `meetings/` without rewriting it.

Promote only a stable, reusable source to `01_knowledge_base/sources/` when at least two tasks need it, its provenance is clear, and the destination owner is unambiguous. Preserve a link from the task to the canonical source. A summary may become knowledge, but a transcript does not become canonical merely because it was summarized.

Anything ambiguous stays in `00_inbox/` or in the originating task pending user review.
