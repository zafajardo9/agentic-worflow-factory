# Harness Factory

Harness Factory is a skills-only plugin for taking a software change from intake through human approval, implementation, and user-facing QA. All hosts use the same [constitution](HARNESS.md), skill instructions, and templates.

## Run a stage

| Skill | Output |
| --- | --- |
| `harness-spec` | A feature spec with evidence, acceptance criteria, and questions rated by impact. |
| `harness-bug` | A bug spec with expected and observed behavior, root-cause confidence, and regression criteria. |
| `harness-workflow` | An implementation and verification plan mapped to the approved requirements. |
| `harness-review` | Findings for the section, document, diff, layer, or QA evidence you ask it to review. |
| `harness-execute` | The approved code changes and implementation check results. |
| `harness-qa` | User-facing test results and any failures or verification gaps. |

Start with spec or bug intake. Approve that revision, call workflow, approve the workflow revision, then call execute and QA separately. Review is optional and can be called at any point. A QA failure against agreed behavior can start a new bug intake. If expected behavior is unclear, revisit the spec.

For example, invoke `harness-spec` with “Let customers retry a failed submission without losing their input.” Then invoke `harness-review` with “Review the acceptance criteria for retry and duplicate submissions.” Explicitly approve the spec fingerprint presented when ready. Default work-item files live under `.harness/<task-slug>/` in the project you are working on. The two human approval gates apply to the exact spec and workflow revisions.

## Reuse context across stages

Harness carries forward useful information from prompts when you invoke its stages. Task memory in `.harness/<task-slug>/context.md` records decisions, blockers, the next action, and pointers to existing evidence. Project memory in `.harness/memory.md` carries durable preferences and confirmed conventions across tasks. Both files live in the target project and are readable in a fresh chat opened there.

For example, tell a stage “Remember for this project that browser QA uses the staging sandbox” or “Forget the old staging sandbox preference.” A refinement such as “Retry only network failures for this task” belongs with the work item and goes through spec approval if it changes expected behavior. The plugin saves compact notes from Harness invocations. Approvals and check results come from their original artifacts.

If your project already uses [Graphify](https://github.com/Graphify-Labs/graphify) or another repository map, Harness can use it to find candidate files and verify them against current source. You can use the context index with ordinary local search on any supported host.

### Optional Graphify setup

Install the official CLI once with `uv tool install graphifyy`. Open a shell at the root of each repository you want to index, then run:

```sh
graphify extract . --code-only --backend none
graphify query "Where is UserService called?" --graph graphify-out/graph.json --budget 1000 --depth 2
```

Replace `UserService` with a symbol in that repository. The extract command builds a local code index without an LLM backend. Rerun it to refresh the index as code changes. For Harness-only use, add `Harness may query the local Graphify index for cross-file discovery` to the target repository's agent instructions, or ask for Graphify when invoking a stage. The CLI and repo index are sufficient for Harness. See the [official Graphify setup and CLI reference](https://github.com/Graphify-Labs/graphify#install).

## Install and update

### Quick install with the Skills CLI

With Node.js installed, run this from the project where you want the six skills:

```sh
npx skills add zafajardo9/agentic-worflow-factory
```

Select all six Harness skills and your agent. Add `--global` for a user-wide install, or `--skill harness-review` to install a single stage. These are standalone skills, so use your agent's skill picker or its standalone invocation syntax. See the [Skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md).

The GitHub commands work once the files are on the repository's default branch. For a local checkout, use its absolute path as the source.

After pushing changes to GitHub, run `npx skills update -p` from each project where you installed Harness. If you installed Harness globally, run `npx skills update -g` once per machine. Both commands update all installed skills in the selected scope.

### Claude Code

```sh
claude plugin marketplace add zafajardo9/agentic-worflow-factory
claude plugin install harness-factory@zafajardo-harness --scope user
```

Run the install command from a target repo with `--scope local` for yourself in that repo, or `--scope project` for shared project settings. Invoke the stage as `/harness-factory:harness-spec`, substituting the skill name as needed.

For a one-session trial, launch `claude --plugin-dir /path/to/checkout` from the target project. After a remote release, run `claude plugin marketplace update zafajardo-harness` and `claude plugin update harness-factory@zafajardo-harness` with the matching scope, then start a new session or use `/reload-plugins`. See [Claude Code plugin installation](https://code.claude.com/docs/en/discover-plugins).

### ChatGPT desktop and Codex

```sh
codex plugin marketplace add zafajardo9/agentic-worflow-factory
```

Restart the desktop app, open the Plugins Directory, choose the **Harness Factory** marketplace, and install **harness-factory**. In a new chat, use the skill picker or type `$harness-spec` and select the installed skill. The local install is available across projects. To configure it for a trusted repo, use that repo's `.codex/config.toml`:

```toml
[plugins."harness-factory@zafajardo-harness"]
enabled = true
```

Use the desktop plugin controls for your user-level default and the project setting for the repo override. After a remote release, run `codex plugin marketplace upgrade zafajardo-harness` and restart the desktop app. See [OpenAI plugin packaging and distribution](https://developers.openai.com/plugins/build/plugins).

### Google Antigravity

```sh
agy plugin install https://github.com/zafajardo9/agentic-worflow-factory
```

This installs to your profile. Invoke `/harness-spec` and substitute the skill name for other stages. To refresh a manually installed copy, reinstall from the updated source. If the client reports that the plugin already exists, uninstall it with `agy plugin uninstall harness-factory` and install again.

For workspace-only discovery, use the Skills CLI or copy the six skill directories from `skills/` into the target project's `.agents/skills/`. Refresh these copies after pulling an update. See [Antigravity plugins](https://antigravity.google/docs/plugins) and [workspace skills](https://antigravity.google/docs/skills).

## Maintain the plugin

Edit `skills/<name>/SKILL.md` or its references. For shared rules, edit the root `HARNESS.md`, run `node scripts/sync-harness.mjs`, and commit the generated copies. Each skill carries its own copy so it works when installed individually. For a release, bump the version in the root manifest and all three host manifests together, then commit and push. The marketplace files point to the same checkout.

For local packaging checks, run `claude plugin validate .`, `codex plugin marketplace list` from the checkout, and `agy plugin validate .` where those tools are installed. After installation, try a spec in a disposable project. Confirm that it stops at approval, review produces findings without editing the spec, and execute cannot start when an approved artifact has been edited since approval.
