# Software Factory

- **Author** zafajardo9
- **Date** 2026-11-19
- **Status** Working proposal for discussion

## Overview

Create a workspace for each product you maintain. Start with a product idea and a goal, or attach an existing GitHub repository. The workspace turns feature ideas, bugs, and QA findings into visible work and carries approved items through your development process. One versioned workflow and developer playbook can power multiple workspaces.

## Project setup and idea capture

1. **Create a project.** Enter a name, short product brief, target users, and what the first release should accomplish. Select an existing repository or create a new one through a separate, explicit GitHub connection step. A project can collect ideas while its repository is still being set up.
2. **Start the first backlog.** The Project Manager proposes milestones and a small set of feature cards from the product brief. You choose what to keep and prioritize. Later, **Add idea** puts a card into Backlog immediately. Capture can start with a single sentence and can include a screenshot or reference. GitHub issues and QA findings also enter here with their source and evidence.
3. **Research a backlog idea on request.** A maintainer chooses **Research** on a backlog card. The read-only research role receives the original idea, product context, and known constraints. If missing details could change the recommendation, it posts focused questions on the card and resumes when the maintainer answers. It searches the live web, opens relevant sources, and returns dated findings, recommendations, tradeoffs, and direct links. If live web access is unavailable, the card shows what still needs verification. The workflow attaches the completed summary to the same card for the maintainer and Project Manager to use during spec drafting. The card stays in its current stage and keeps its queue status.
4. **Turn a card into a spec when it is ready.** An idea starts as a backlog item. A spec records what to build for that item. Choose **Draft spec** to have the Project Manager write the user problem, proposed scope, acceptance criteria, dependencies, and checks. The card retains its identity and its original idea. A larger feature can have a parent spec and linked child issues with their own acceptance criteria and execution status.
5. **Approve and queue.** The default for a user-submitted idea is to approve the spec before implementation. Routine work can follow a project-level auto-queue policy. Unanswered questions stay visible on the relevant card with the person or role needed to move it forward.

## What you see in the factory

The project workspace opens on a **Backlog → Spec → Building → Review → Done** board. Intake is a status within Backlog. Checks and repair attempts are visible within Building. Ready to Merge lives in Review. A blocked card stays in its stage and shows the reason and next action. The core workflow keeps these detailed states for retries and audit history.

- **Each card** shows its title, current status, and who or what acts next. Opening it shows the original idea, research questions and findings when available, current spec, decisions, dependencies, check results, and linked PR when available.
- **Live activity** records meaningful events such as “QA found a failing check,” “Frontend pushed a repair,” and “Waiting for your approval.” Show the latest update and whether work is running, queued, or waiting. The board changes when the runner records a transition.
- **Controls** include adding an idea, requesting research, drafting a spec, approving and queuing work, pausing or resuming eligible runs, and selecting allowed check modes. State changes use the same workflow rules whether initiated in the workspace or through GitHub.
- **GitHub connection.** Once linked, GitHub Issues hold work and specs, and GitHub PRs hold changes. The run record drives the factory board. GitHub Projects can provide the initial live board and a secondary view once the factory workspace exists. For ideas captured before linking, keep drafts in the workspace and give the user an explicit publish action. Keep a mapping so a retried publication reuses the same issue.

The in-chat board is a simulated product preview. For live use, a project would connect the factory workspace to the runner’s state and approval actions. A run could be started manually from a supported coding environment or unattended through GitHub Actions. Both entry points must claim the same issue before building to avoid overlapping work.

## Discovery and delivery loops

Two loops share the same issue pipeline.

- **Discovery loop.** A manual or scheduled QA run checks the repository’s default branch and optionally an approved preview. It runs configured health checks and looks for measurable performance regressions. Each actionable finding becomes a GitHub issue with evidence and a stable identifier. A repeat updates the existing issue. A project can choose whether certain findings queue automatically or wait for your approval.
- **Delivery loop.** A maintainer-created or QA-created issue enters intake once it is eligible. The workflow prepares a spec, builds a change, checks it, and sends it to the relevant reviewers. Blocking feedback returns to the builder. After a human merges the PR, GitHub closes the issue and the board moves it to Done. Discovery continues on its own schedule.

## Issue lifecycle

1. **Intake.** The Project Manager checks scope, priority, duplicates, and missing information. It chooses the builder and review roles. Ambiguous work moves to Blocked with a specific question. Start with an explicit `agent-ready` label applied by an authorized maintainer, or added by the workflow under an enabled auto-queue policy.
2. **Spec.** The Project Manager turns the issue into acceptance criteria, identifies affected areas, and proposes checks. Clear, low-risk work can proceed under the project’s policy. Changes to public contracts, migrations, or broad scope can pause for approval.
3. **Build.** The Frontend or Backend role works on a branch linked to the issue and opens or updates one draft PR. For work spanning both areas, the spec assigns ownership of each part. The MVP can run these changes sequentially on the same branch.
4. **Checks.** The workflow calls the project’s `checks.sh` or configured entry point. It records the commands, results, and commit checked. QA compares the result with the acceptance criteria and notes skipped checks.
5. **Review.** Code review checks correctness and maintainability. UX review checks user flows and accessibility. Design review compares the change with supplied design references when relevant. Defensive security review flags unsafe code patterns and recommends fixes. The project policy selects reviewers by change type, with code review on by default. Reviewers receive the spec, diff, and check results in a fresh context. If a required reviewer lacks evidence, the run pauses for that evidence.
6. **Rework or handoff.** A failed check or blocking finding returns to the builder with a specific change request. Recheck the new commit and rerun relevant reviews. Start with two repair attempts, then move to Blocked with the remaining findings and a way to resume. A passing run hands the PR to you with the spec, checks, skipped steps, and reviewer findings. A change to the PR head invalidates prior verification for handoff.

The workflow owns stage transitions and updates the board from the recorded issue state. An out-of-sync board update can retry without repeating the build. A merged PR completes delivery on the board. A project that tracks releases separately can also show when a delivered feature reaches users. [GitHub Projects board layout](https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/quickstart-for-projects)

## Check controls

| Mode | Behavior |
| --- | --- |
| Full | Run configured lint, typecheck, build, automated tests, and any relevant smoke or performance checks. This is the proposed default. |
| Skip optional tests | Run required checks and other enabled checks. Record which optional tests were skipped and why. |
| Skip optional checks | Skip the local check bundle when project policy permits. Keep required checks and the normal review and merge gates. |

Set the default per repository. Allow a maintainer to override it for an issue or run where policy permits, with a reason visible in the PR. Show skipped checks explicitly. If the workflow publishes a required aggregate check, it must evaluate whether mandatory checks ran and passed on the current commit. GitHub can report a conditionally skipped job as successful. [GitHub required check behavior](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks)

## Installation and model portability

- **Reusable repository.** Publish the orchestrator, role instructions, check and review policies, and provider adapters in one versioned repository. Each project opts in through a small GitHub Actions workflow pinned to a release commit, a project configuration file, and credentials for the selected provider. Where a project already has CI, call the same check commands it uses. Confirm that the pilot repo can access the shared workflow under your GitHub settings. [GitHub reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- **Your developer playbook.** Keep a shared playbook for how you write specs, break up work, review diffs, and decide what is ready to merge. Each project adds its commands, conventions, and constraints. Capture the details from a recent issue and PR of yours. New roles, such as Documentation or Accessibility, can use the same interface for inputs, findings, and requested next steps.
- **Model adapters.** Start with one API or supported headless coding runtime. Keep role instructions and handoff formats portable so OpenAI/Codex, Anthropic/Claude, or another provider can be added through an adapter. The orchestrator owns issue state, retries, budgets, and GitHub writes. Adapters handle the provider’s authentication, tool capabilities, and output format. Interactive chat can use the same playbook as a manual entry point. Each unattended runtime needs its own integration. The future runner must provide live public web search and page retrieval for the research role. In the interactive pilot, use the repo-local Codex skill `$web-research` to carry out the same research workflow in chat.
- **GitHub credentials and triggers.** Decide the board owner during pilot setup. GitHub documents using an App for organization Projects and a personal access token for user Projects. The repository’s default Actions token cannot update Projects and normally does not chain issue events into new runs. QA should explicitly dispatch intake for an eligible issue. If automatic PR CI is required, validate the PR creation identity on the pilot repo. [Projects authentication](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions), [Workflow trigger behavior](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow)
- **Run controls.** Persist one active run and one linked PR per issue. Record the stage, attempts, current commit, and latest evidence so a rerun can resume safely. Pause on missing input, exhausted repair or cost limits, or an explicit stop. Treat issue text and repository content as inputs. Keep write credentials with the workflow steps that publish approved changes and run project code in an isolated environment.

## Rollout and acceptance

1. **Manual pilot on one repository.** Use GitHub Projects, one provider, a maintainer queue label, and manual QA discovery. Capture a one-sentence feature idea, use `$web-research` in chat to clarify the decision and verify recommendations against live sources, draft its spec, approve it, and carry the same card through to a PR. Confirm a QA finding creates an issue in the same backlog and a repeated finding updates that issue.
2. **Exercise the feedback loop.** Demonstrate a failed check that returns to Build, an optional test skip visible in the PR, and a run that moves to Blocked after its last attempt. Resume it without creating another PR. Verify that merge closes the issue and updates the board.
3. **Enable bounded scheduled discovery.** Set the schedule, the maximum issues per run, thresholds, and which findings can enter the queue automatically. Use repeated measurements against a comparable baseline for performance regressions. Track issues filed, issues that needed intervention, repair attempts, and model spend.
4. **Build the live factory workspace.** Connect the board, card details, activity, and approval controls to the same stage records used by the pilot. Verify that a fresh view shows the current stage after interruptions and that retrying a write does not duplicate cards, issues, or PRs.
5. **Prove portability.** Install the pinned workflow in a second repository with different check commands. Then exercise a second model adapter against the same role handoffs. Add hosted GitHub App onboarding if installation across projects becomes the bottleneck.

The proposed pilot uses GitHub Actions and GitHub Projects to keep installation small. The planned factory workspace adds project creation, idea capture, and a detailed run view. It will need authentication and durable storage for unlinked drafts and run records. Confirm the issue pipeline in the pilot before using it to power the workspace.

## Decisions to refine

- Which parts of your usual issue-to-PR process should be automatic, and where should the workflow ask you?
- Which repository should be the pilot, and who owns its GitHub Projects board?
- Which checks are mandatory, and what kinds of QA findings can queue their own fixes?
- Which model runtime should run the first pilot?
