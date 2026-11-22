---
name: harness-workflow
description: Plan implementation and verification for an approved Harness Factory spec when the user calls harness-workflow.
disable-model-invocation: true
---

# harness-workflow

Read [HARNESS.md](../../HARNESS.md) relative to this skill before proceeding. Apply its stage boundary, work-item conventions, and approval rules. Run this stage only when the user explicitly requests it.

Verify the selected spec approval. Read the actual integration points, existing conventions, and available checks. Build an ordered workflow with requirement IDs, affected components, proposed changes, dependencies, and verification actions. Address compatibility, rollout, and recovery where the change warrants it. Include user-facing acceptance checks for QA and concrete expected observations. Write `workflow.md` using the [workflow template](references/workflow-template.md).

Check that every requirement has a step and a verification action, each step traces to scope, and the planned checks can exercise the normal entry points. Return ambiguities or scope changes to spec. Present the workflow revision for approval and stop before implementing.
