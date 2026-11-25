# Harness Factory

Harness Factory is a skills-only plugin for taking a software change from intake through human approval, implementation, and user-facing QA. All hosts use the same [constitution](HARNESS.md), skill instructions, and templates.

## Run a stage

| Skill | Output |
| --- | --- |
| `web-research` | Dated findings, tradeoffs, and recommendations backed by live web sources. |
| `harness-spec` | A feature spec with evidence, acceptance criteria, and questions rated by impact, optionally starting from an existing GitHub issue. |
| `harness-bug` | A bug spec with expected and observed behavior, root-cause confidence, regression criteria, and a GitHub issue for the work. |
| `harness-workflow` | An implementation and verification plan mapped to the approved requirements. |
| `harness-review` | Findings for the section, document, diff, layer, or QA evidence you ask it to review. |
| `harness-execute` | The approved code changes and implementation check results. |
| `harness-qa` | User-facing test results, any failures or verification gaps, and a GitHub issue per failure. |

Start with spec or bug intake. Approve that revision, call workflow, approve the workflow revision, then call execute and QA separately. Review is optional and can be called at any point. Run `web-research` on demand when an idea or spec needs current evidence. It uses your host's live web search or browsing tool and returns findings in chat. A QA failure against agreed behavior can start a new bug intake. If expected behavior is unclear, revisit the spec.

For example, invoke `harness-spec` with “Let customers retry a failed submission without losing their input.” Then invoke `harness-review` with “Review the acceptance criteria for retry and duplicate submissions.” Explicitly approve the spec fingerprint presented when ready. Default work-item files live under `.harness/<task-slug>/` in the project you are working on. The two human approval gates apply to the exact spec and workflow revisions.

## GitHub issues

With the GitHub CLI installed and authenticated, `harness-bug` and `harness-qa` file issues in the target project's repository so the work is visible to everyone. Each issue carries a `harness:bug` or `harness:qa` label, the evidence and work-item links, and a stable `Harness-Dedupe` marker, so a repeat run updates the existing issue instead of opening another. Point `harness-spec` at an issue number or URL to start the cycle from it, for example `/harness-spec #42`; the spec stage labels the issue `harness:spec` and comments the draft. Later stages add a one-line status comment to a linked issue.

The bundled `scripts/harness-issue.sh` helper runs from inside the target project:

| Command | What it does |
| --- | --- |
| `check` | Reports gh, authentication, the GitHub repository, and whether issues are enabled. |
| `repo` | Prints the target repository as `owner/name`. |
| `ensure-labels` | Creates or refreshes the `harness:bug`, `harness:qa`, and `harness:spec` labels. |
| `find "<marker>"` | Finds the issue whose body carries the marker. |
| `create ...` | Creates an issue, or updates the matching one when `--marker` is given. |
| `update <n> ...` | Edits an issue's title, body, or labels. |
| `comment <n> ...` | Adds a comment. |
| `view <n\|url>` | Prints an issue for spec intake. |

If `gh` is missing, unauthenticated, or the project has no GitHub remote, the helper writes the same title, body, and labels to `--payload-file` when given, or prints them, instead of filing anything and exits with code 3. The stage tells you the issue was not filed and gives the manual command. Keep credentials, tokens, and private payloads out of issue bodies. Issues are records, not approvals; the approval gates below still apply to the exact spec and workflow revisions.

## Reuse context across stages

Harness carries forward useful information from prompts when you invoke its stages. Task memory in `.harness/<task-slug>/context.md` records decisions, blockers, the next action, pointers to existing evidence, and a trail of links to each stage's artifacts. Project memory in `.harness/memory.md` carries durable preferences and confirmed conventions across tasks. Both files live in the target project and are readable in a fresh chat opened there.

For example, tell a stage “Remember for this project that browser QA uses the staging sandbox” or “Forget the old staging sandbox preference.” A refinement such as “Retry only network failures for this task” belongs with the work item and goes through spec approval if it changes expected behavior. The plugin saves compact notes from Harness invocations. Approvals and check results come from their original artifacts.

### Project knowledge graph (Graphify)

Each spec, bug, workflow, execute, and QA stage keeps a [Graphify](https://github.com/Graphify-Labs/graphify) knowledge graph of the target project and adds to it as work moves forward. The graph covers both the source code and the Markdown notes under `.harness/`. Spec requirements, workflow steps, decisions, and lessons link to the code symbols they mention and to each other, so a later stage or a fresh chat can follow the trail without searching again. The graph builds locally from the code's syntax tree and the notes' headings and links, with no LLM or API key.

Every stage uses the bundled `scripts/harness-graph.sh` helper:

| Command | What it does |
| --- | --- |
| `check` | Reports whether the Graphify CLI, the graph, and the Harness notes are present. |
| `install` | Installs the `graphifyy` CLI with uv, pipx, or pip when it is missing or outdated. |
| `update` | Builds or incrementally refreshes `graphify-out/graph.json` from code and `.harness/**/*.md`. |
| `query "<question>"` | Finds related code, requirements, and earlier decisions. |
| `section "<heading>"` | Prints a linked note section, such as a requirement. |
| `remember <outcome> "<q>" "<a>" [nodes]` | Records whether a lookup was useful, a dead end, or corrected, in `.harness/graph-memory/`. |
| `lessons` | Aggregates those outcomes into `.harness/LESSONS.md`. |

A stage checks for the CLI first and installs it if needed. It then refreshes the graph and queries it before doing a broad search. Before handing back, it writes notes that reference symbols such as `SubmitService.retry` and link earlier artifacts, then refreshes the graph so the next stage starts from it. Graph results are only navigation hints, so each stage confirms them against current source and the approved artifacts.

After installing Harness in a project, invoke any stage, such as `harness-spec`, and it sets up the graph on first use. To build the graph up front, run this from the project root:

```sh
uv tool install graphifyy   # skip if `graphify --help` already works
graphify update .           # writes graphify-out/graph.json, no API key needed
```

Keep `.harness/` out of `.gitignore`, because Graphify skips ignored files. Commit `.harness/`, because it holds the durable memory. `graphify-out/` can be rebuilt with `update`, so committing it or adding it to `.gitignore` is up to you. To turn the graph off, tell a stage “Remember for this project: do not use Graphify.” To install the CLI manually, run `uv tool install graphifyy`. See the [Graphify CLI reference](https://github.com/Graphify-Labs/graphify#install).

## Install and update

### Quick install with the Skills CLI

With Node.js installed, run this from the project where you want the seven skills:

```sh
npx skills add zafajardo9/agentic-worflow-factory
```

Select all seven skills and your agent. Add `--global` for a user-wide install, or `--skill harness-review` to install a single stage. These are standalone skills, so use your agent's skill picker or its standalone invocation syntax. See the [Skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md).

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

For workspace-only discovery, use the Skills CLI or copy the seven skill directories from `skills/` into the target project's `.agents/skills/`. Refresh these copies after pulling an update. See [Antigravity plugins](https://antigravity.google/docs/plugins) and [workspace skills](https://antigravity.google/docs/skills).

## Maintain the plugin

Edit `skills/<name>/SKILL.md` or its references. For shared rules, edit the root `HARNESS.md`, run `node scripts/sync-harness.mjs`, and commit the generated copies. The same sync copies the root `harness-graph.sh` and `harness-issue.sh` into each skill's `scripts/` directory, so edit only the root copies. Each skill carries its own copy so it works when installed individually. For a release, bump the version in the root manifest and all three host manifests together, then commit and push. The marketplace files point to the same checkout.

For local packaging checks, run `claude plugin validate .`, `codex plugin marketplace list` from the checkout, and `agy plugin validate .` where those tools are installed. After installation, try a spec in a disposable project. Confirm that it stops at approval, review produces findings without editing the spec, and execute cannot start when an approved artifact has been edited since approval.
