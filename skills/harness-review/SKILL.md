---
name: harness-review
description: Audit a requested spec section, workflow, implementation layer, diff, or QA report when the user calls harness-review.
disable-model-invocation: true
---

# harness-review

Read [HARNESS.md](references/HARNESS.md) relative to this skill before proceeding. Apply its stage boundary, work-item conventions, and approval rules. Run this stage only when the user explicitly requests it.

Identify the requested target and its applicable baseline. Review can operate on drafts, approved artifacts, or implementation evidence. For specs, challenge ambiguity, testability, edge cases, and scope. For workflows, check dependency order, integration points, and requirement-to-check coverage. For code, inspect the relevant diff and callers for correctness, regressions, and scope. For QA, check the relevance, revision, and sufficiency of the evidence. Use non-mutating inspection and appropriate checks where they can confirm a finding.

Report actionable findings ordered by severity with location, evidence, impact, requirement when applicable, and a concrete next action. Distinguish an evidenced defect from an open question. If nothing actionable is found, state the reviewed scope and limits. Keep approval decisions with the user and leave the reviewed artifact or product code as it was.
