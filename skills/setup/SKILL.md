---
name: setup
description: Prepares a repository to document architecture with cfourdev — checks and installs the cfour CLI, refreshes the plugin's knowledge of the tool and its documentation, creates a workspace, and gets the MCP connection authorised. Use on the first run in a repository, when the cfour command is missing, when there is no cfour.yaml, when the MCP server is not answering, or when someone asks to set cfourdev up.
---

# Getting the environment ready

This is an installer, not a report. Anything that can be done safely without
asking, do — then say what you did. Ask only where a decision is genuinely
theirs: naming things, installing software globally, and anything that reaches
their account on the platform.

There is not much to it, and that is the point: cfourdev has one structural
file, nothing to register, and no index to keep. Work through the state, not
through a script. Start here:

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

It needs a recent Node; if the install refuses on the Node version, on npm
permissions, or on a global prefix, say what happened and what would fix it — a
Node version manager, or a different prefix — and read
`doc comecando/instalacao` for the current requirements rather than guessing at
them. Do not attempt to work around a failed install by writing YAML directly;
without the CLI there is no validation, and an unvalidated model is worse than
none.

## The knowledge cache — `cli-cache-stale`, `doc-missing`

Run it without asking. It is local, quick, and reversible:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" sync --data "${CLAUDE_PLUGIN_DATA}"
```

This reads the installed CLI's own command tree and downloads the official
documentation, then slices both so that later work can pull one command or one
page at a time. `cli-cache-stale` after an upgrade means exactly this: the CLI
moved and the stored knowledge did not. Re-syncing is the whole fix.

Two failures are worth reporting rather than retrying:

- `origin-unknown` or a network error — the documentation could not be reached.
  Not fatal, and worth being precise about what is lost: the CLI still answers
  everything about commands, and `cfour help formato` still answers the format's
  own rules offline. What is missing is the field-by-field detail. Say that and
  carry on.
- `unexpected-content` — something answered, but it was not the documentation.
  Usually a captive portal or a proxy. Worth mentioning; do not store it.

## The workspace — `workspace-missing`

`cfour.yaml` is the only structural file, and the only path the CLI resolves by
walking up from the working directory. Its directory is the workspace root.
Without that file, nothing can be written here.

**Before creating one, look at the neighbours.** A repository holds several
workspaces side by side, one per system, so "there is no `cfour.yaml` above this
directory" does not mean the repository is empty — and `status` lists the ones
it found beside this directory. If one of them is this system, the answer is to
work there, not to create a second workspace for the same system.

`cfour init` creates the workspace, along with the smallest model that already
draws something. It takes an id and a display name, and those are the person's
to choose — but propose defaults from the directory or the system name rather
than asking cold:

```bash
cfour init --id <id> --nome "<name>"
```

The id is worth one sentence of care before running: it is declared rather than
derived from the folder name precisely so that renaming the directory does not
break the published address. Confirm the proposal in one line and run it.

Two things it decides for you, and both are worth one line of explanation:

- **the workspace's scope.** One workspace draws one system: it has exactly one
  context diagram, and the tool refuses a second. If they described more than
  one system, that is more than one workspace, created side by side — not more
  root boxes in this one.
- **the repository it publishes to.** `cfour.yaml` carries that separately from
  the workspace id, because it is what holds the permission, the publishing key
  and the first segment of the public address. When a sibling workspace already
  exists, `cfour init` copies its value, which is what makes a tree of sibling
  workspaces publish as one repository with one key.

Then look at what it made: `cfour check --inventory --json` shows the starter
model, which is a real model and not a placeholder — its elements and its view
can be renamed or removed once real content exists. Renaming is free: ids are
generated and reference nothing, so nothing breaks.

If `cfour init` refuses because a workspace already governs this directory, that
is the answer, not an obstacle. Read it rather than creating a second one on top
of it.

## Reading other workspaces — only when they raise it

A workspace draws its own content. Reading someone else's alongside it is
declared with `cfour uses`, pointing either at a sibling folder of this tree or
at a workspace published on the platform. Bring it up when they mention another
team's system, a shared glossary, or a diagram that should span more than one
system; do not configure it pre-emptively.

For a published participant, `cfour pull` downloads it once and everything after
that works offline. It writes two things, and they go to opposite sides of the
line: the downloaded material into `.cfour/`, which belongs **outside** git, and
a lock file recording which version of each participant was in force, which
belongs **inside** it. Nothing adds the ignore rule for you, so add it — that is
an ordinary repository file and not the CLI's to write.

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
  buys them: reading workspaces that have been published to the platform,
  including workspaces from other repositories. It is read-only access.

This is not required to work locally. A repository with a workspace in its
working tree is fully usable through the CLI alone, and if someone only wants to
document *this* repository, MCP is optional. Say so rather than making it look
like a blocked step.

## Publishing — only if they raise it

Publishing needs an account key, which is generated on the platform and which
you cannot create for them. Bring it up only if they ask about publishing, about
sharing the model, or about the portal:

```bash
cfour login --key c4_<...>
cfour push --dry-run          # shows what would be published
```

One key reaches a list of repositories, and which repository a push lands in
comes from the workspace's own `cfour.yaml` — so a tree of sibling workspaces
needs one key, and each workspace is pushed from its own directory. `cfour keys`
shows which stored key applies here. A workspace is published only when its
status is `active`, which is what `cfour init` sets; `reference` and `archived`
workspaces stay local. If the platform refuses a push because the CLI is too
old, upgrading it is the fix — and re-sync the cache afterwards.

## Finish by proving it works

Do not report success from exit codes alone:

```bash
cfour check --json
```

Then tell them, in two or three lines, what they now have and what they can say
next — for example, that you can look at the repository and propose how to model
it. Keep it about their architecture, not about the installation.
