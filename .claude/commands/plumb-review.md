---
description: Review a Plumb file or diff against the specs
argument-hint: [path to file, or "diff"]
---

Review: $ARGUMENTS

Load the `plumb-review` skill and follow its procedure exactly: rules first, spec sections second,
file third. Use its output format verbatim, including the verdict line.

If the argument is empty, review the most recently modified file under `packages/`.
