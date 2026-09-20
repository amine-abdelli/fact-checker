---
description: Write a task brief for the Plumb backlog
argument-hint: [what to build, e.g. "stage 4 step 4b search adapter"]
---

Write a task brief for: $ARGUMENTS

Load the `plumb-harness` skill for the brief format. Then:

1. Identify the stage, the owning skill and the sub-agent.
2. Read the governing spec sections and quote the requirement ids the task must satisfy.
3. Check `CLAUDE.md` open decisions — if the task is blocked, say so in the brief header rather
   than writing a brief that cannot be executed.
4. Write it to `docs/ai-harness/tasks/T-<id>-<slug>.md` using the next free id.
5. Acceptance criteria must be checkable by someone who did not write the brief, and the last one
   is always `plumb-review: PASS`.

Then tell me the path and the three acceptance criteria, nothing more.
