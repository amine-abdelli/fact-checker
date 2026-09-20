---
name: plumb-harness
description: Maintain the Plumb AI harness itself. Use when adding or editing a skill, a sub-agent or a slash command, writing a task brief, recording a decision, or when a task needed three revision rounds and the harness needs tightening. Also use when the user asks how the harness works or what to work on next.
---

# Harness maintenance

The harness is the real product of Phase 0: it is what makes every later task cheap and
reviewable. It improves by being edited after each milestone, not by being written once.

## Layout

```
.claude/skills/<name>/SKILL.md      one skill per concern; frontmatter name + description
.claude/skills/<name>/references/   detail loaded only when needed
.claude/agents/<name>.md            sub-agents: same roles, isolated context
.claude/commands/<name>.md          slash commands: the orchestrator's routine moves
docs/ai-harness/                    methodology, workflow, registry, tasks, findings, decisions
```

## Writing a SKILL.md

- Frontmatter: `name` (kebab-case, matches the folder) and `description`. The description is the
  only thing read when deciding whether to load the skill — it must say **when to use it** and
  carry the words a request would actually use. Write it in the third person, one sentence or two.
- Body: what to read first, what to produce, the contract, the hard rules, a done-when checklist.
  Keep it under ~120 lines. Detail goes in `references/`, loaded on demand.
- Imperative and specific. "Read `specs/03-modele-fiabilite-sources.md` §2 before assigning a verdict" beats "be careful with
  verdicts". Every rule should be checkable by someone who did not write it.
- No duplication of `CLAUDE.md`: skills point at the rules, they do not restate them at length.

## Writing a task brief

Briefs live in `docs/ai-harness/tasks/T-<id>-<slug>.md`:

```markdown
# T-1xx — <title>
**Skill:** plumb-xxx · **Agent:** <agent> · **Blocked by:** <task or decision, or nothing>

## Goal
One paragraph: what exists after this task that did not before.

## Read first
- specs/... §...

## Deliverables
- `packages/...` — what it contains

## Acceptance criteria
- [ ] ...
- [ ] plumb-review: PASS
```

A brief that cannot state its acceptance criteria is not ready to be handed to an agent.

## After each milestone — 10 minutes, not optional

- A skill that produced a first-pass PASS → note it as proven in `docs/ai-harness/registry.md`.
- A task that needed 3+ revisions → the brief or the skill was ambiguous. Add the missing
  guardrail to the skill, with a one-line note on what went wrong.
- A recurring new task type → a new skill, not a longer existing one.
- A resolved decision → ADR in `specs/02-architecture-technique.md` §2, tick it in `docs/ai-harness/tasks/T-000-open-decisions.md`,
  and update the "Open decisions" table in `CLAUDE.md`.

## Answering "what should I work on next?"

Read `docs/ai-harness/tasks/` and `docs/ai-harness/workflow.md`, then answer with: the next
unblocked task, what blocks the others, and the one decision that would unblock the most work.
