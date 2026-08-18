---
name: setup
description: Prepares a repository to document architecture with cfourdev — checks and installs the cfour CLI, refreshes the plugin's knowledge of the tool and its documentation, creates the model registry, and gets the MCP connection authorised. Use on the first run in a repository, when the cfour command is missing, when there is no cfour.yaml, when the MCP server is not answering, or when someone asks to set cfourdev up.
---

# Getting the environment ready

This is an installer, not a report. Anything that can be done safely without
asking, do — then say what you did. Ask only where a decision is genuinely
theirs: naming things, installing software globally, and anything that reaches
their account on the platform.

Work through the state, not through a script. Start here:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" status --data "${CLAUDE_PLUGIN_DATA}"
```

Everything below is keyed to what that reports.

## The CLI — `cli-missing`

Nothing works without it: the CLI is the only way this plugin writes a model,
and it is also where the plugin learns what the tool can do.

Offer to install it, in one sentence, and then do it:

```bash
npm i -g cfour-cli
```

If npm is not available, or the install fails on permissions, say what happened
and what would fix it — a Node version manager, or a different global prefix.
Do not attempt to work around a failed install by writing YAML directly; without
the CLI there is no validation, and an unvalidated model is worse than none.

## The knowledge cache — `cli-cache-stale`, `doc-missing`

Run it without asking. It is local, quick, and reversible:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" sync --data "${CLAUDE_PLUGIN_DATA}"
```

This reads the installed CLI's own command tree and downloads the official
documentation, then slices both so that later work can pull one command or one
topic at a time.

Two failures are worth reporting rather than retrying:

- `origin-unknown` or a network error — the documentation could not be reached.
  Not fatal: the CLI still answers everything about commands. Say that the
  format documentation is unavailable and carry on.
- `unexpected-content` — something answered, but it was not the documentation.
  Usually a captive portal or a proxy. Worth mentioning; do not store it.

## The registry — `registry-missing`

`cfour.yaml` is the file every command resolves from, walking up from the
working directory. Without it, nothing can be written.

`cfour init` creates it along with the smallest model that already draws
something. It takes an id and a display name, and those are the person's to
choose — but propose defaults from the repository name rather than asking cold:

```bash
cfour init --id <id> --nome "<name>"
```

Confirm the proposal in one line and run it. Then look at what it made:
`cfour check --inventory --json` shows the starter model, which is a real model
and not a placeholder — the example project it creates can be renamed or removed
once real content exists.

If a `cfour.yaml` already exists but points at models that are not on disk,
`cfour modelagem list --json` shows `existe: false` for those. Report it; do not
silently re-create anything.

## The MCP connection

The plugin ships the server declaration, so there is nothing to configure. What
remains is authorisation, which only the person can give.

Check whether you already have tools from the `cfourdev` server available to you
in this session — they are named `mcp__cfourdev__*` or
`mcp__plugin_cfour_cfourdev__*` depending on the Claude Code version.

- **You have them** — nothing to do. Say that queries about published models
  will work.
- **You do not** — they need to authorise it once, in a browser, with `/mcp` in
  Claude Code (or `claude mcp login cfourdev` from a shell). Explain what it
  buys them: reading models that have been published to the platform, including
  models from other repositories. It is read-only access.

This is not required to work locally. A repository with a model in its working
tree is fully usable through the CLI alone, and if someone only wants to
document *this* repository, MCP is optional. Say so rather than making it look
like a blocked step.

## Publishing — only if they raise it

Publishing needs an account key, which is generated on the platform and which
you cannot create for them. Bring it up only if they ask about publishing, about
sharing the model, or about the portal:

```bash
cfour login --key c4_<...>    # stores the key and binds it to this repository
cfour push --dry-run          # shows what would be published
```

`cfour keys` shows which stored key applies here. Only models with
`status: active` are published.

## Leftovers from an earlier plugin version

If `.claude/cfour/` exists in the repository, it is state from a previous
version of this plugin and nothing reads it any more. Mention it and offer to
remove it. Do not migrate anything out of it: decisions worth keeping belong in
the model itself, as notes (`cfour note add --kind decisao`), where the whole
team can see them.

## Finish by proving it works

Do not report success from exit codes alone:

```bash
cfour check --json
```

Then tell them, in two or three lines, what they now have and what they can say
next — for example, that you can look at the repository and propose how to model
it. Keep it about their architecture, not about the installation.
