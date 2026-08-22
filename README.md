# cfourdev for Claude Code

[cfourdev](https://cfourdev.com.br) keeps software architecture documented as a
C4 model that lives in your repository: YAML in an open format, versioned and
reviewed alongside the code, with the diagrams as a consequence of the model
rather than a separate artefact.

This plugin is the modelling partner for it. You describe your system in your
own words; it works out what the system actually is, decides how that should be
represented in C4, and materialises the decision through the `cfour` CLI.

```
Set cfourdev up in this repository.
Read this repository and propose how we should model it.
We also have a worker consuming orders from Kafka — add it.
Does this split into containers make sense?
Who depends on the pricing service?
Show me the checkout flow, from the customer to the payment gateway.
Open the viewer so I can see it.
```

## What it is for

**C4 first, cfourdev second.** The plugin is a C4 modelling tool that happens to
store its results in cfourdev. If you ask for something to be represented at a
level where it does not belong — a folder as a container, a team as a boundary,
an environment as an element — it says so, explains what you are actually trying
to represent, and proposes the correct form. A model that stores cleanly and
means the wrong thing is the failure it is built to prevent.

The same line runs the other way. Most of cfourdev's concepts are storage, and
the plugin keeps them out of your architecture: a **model** is a folder where
elements are filed, a **view** is a drawing. Neither is a C4 level, and neither
is ever proposed as a home for a concept that does not fit C4. A **workspace**
is the one that does carry weight — it has exactly one context diagram, so one
workspace is one system, and a repository holds as many as it has systems, read
together.

**It tells you what it knows and what it guessed.** Facts, inferences,
hypotheses and recommendations stay visibly apart. *"I did not find enough
evidence to say whether this is a separate container"* is an answer it is
willing to give.

**Depth follows uncertainty.** Trying cfourdev with a Node API and a PostgreSQL
gets two stated assumptions and a working model. A logistics platform with forty
services gets progressive discovery, a system context validated before anything
below it, and work in increments.

## How it works

Four sources, each authoritative for one thing:

| | |
|---|---|
| **C4** | what an element means |
| **your repository** | what the software actually is |
| **the `cfour` CLI** | every change to the model, and reading the working tree |
| **the cfourdev MCP server** | reading what has been published to the platform |

The last two are the same split cfourdev itself draws: the CLI works on the
files on your disk and writes them; the MCP server answers questions about
published workspaces, across repositories, and never writes. A model you have
not pushed is invisible to MCP, and the plugin says so rather than reporting it
as missing.

Two rules follow, and the plugin holds to both.

**Writes go through the CLI.** Not because YAML is hard, but because the CLI
validates after writing and rolls back on a new error, and a hand edit does not.
A hook enforces this: an edit aimed at a file belonging to a workspace stops and
asks, naming the command that owns that file. The exception is real — when the
CLI genuinely cannot express something, editing by hand is correct — but it
stays a decision someone makes on purpose, with the reason on screen.

**Capabilities are discovered, never memorised.** The plugin does not carry a
copy of the CLI's manual. It reads the command tree from the CLI you have
installed, and the format documentation from the official source, and caches
both — then serves one command or one page at a time. When the CLI version
changes, the cache notices and refreshes itself. Even the documentation's
address is discovered rather than hardcoded, so the docs can move without a
release here, and when the network is unavailable the installed tool still
answers the format's own rules offline.

That is also what keeps the plugin usable after cfourdev grows: a new command,
a new flag or a new open registry value shows up in the cache on the next sync,
not in the next release of this plugin.

## Installing

```
/plugin marketplace add evandrobreis/cfourdev-claude
/plugin install cfour@cfourdev
```

Then, in the repository you want to document:

```
/cfour:setup
```

Setup installs the CLI if it is missing, builds the knowledge cache, creates the
workspace, and tells you what — if anything — is left for you to do. The MCP
server ships configured; authorising it takes one browser round-trip through
`/mcp`, and is only needed to read what has been published to the platform.
Working locally needs nothing beyond the CLI.

To update:

```
/plugin marketplace update cfourdev
/plugin update cfour@cfourdev
```

## What ends up in your repository

Only the model, in cfourdev's own format — the plugin stores no state of its
own. One directory per system, as many as the repository has:

```
<system>/cfour.yaml            the workspace: identity, appearance, what it reads
<system>/models/<model>/*.yaml elements, relations and notes
<system>/views/<view>.yaml     one diagram or one flow per file
<system>/layouts/<view>.json   where the boxes sit, written by the viewer
```

## What is in the box

| | |
|---|---|
| `skills/modeling` | the entry point: where you are, what kind of request this is, which source answers it |
| `skills/setup` | installs and configures until the environment works |
| `skills/architecture` | understands the software, decides the C4 representation, proposes and reviews |
| `skills/operate` | reads the model, builds and runs CLI commands, validates the result |
| `agents/investigator` | sweeps a large repository for evidence, and deliberately does not classify it |
| `scripts/knowledge.mjs` | the cache: discovers, slices and serves the CLI surface and the documentation |
| `scripts/guard-model.mjs` | the hook that keeps the workspace's files behind the CLI |
| `scripts/eval.mjs`, `evals/` | the behavioural regression suite: real prompts, the real CLI, graded on what the agent said, ran and wrote |
| `.mcp.json` | the cfourdev MCP server, pre-configured |
| `settings.json` | pre-approves the CLI's **read-only** commands, so discovery and validation do not interrupt you. Every command that writes still goes through the normal permission prompt. |

## Requirements

- The CLI: `npm i -g cfour-cli` — setup offers to do this
- Node 18 or later, for the plugin's own scripts
- A cfourdev account, only if you want to publish

## Development

Two suites, because they answer different questions.

```
node --test scripts/verify.mjs
```

The contracts: slicing the documentation, cache invalidation, the guard's
verdicts, and the plugin's own shape. They also check that the prose has not
quietly re-embedded knowledge the plugin is supposed to discover — a hardcoded
documentation address, or a CLI flag written down where it will go stale — and
that no concept from a previous version of cfourdev's structure has survived
anywhere in the plugin. Fast, free, and what CI runs.

```
node scripts/eval.mjs --list
node scripts/eval.mjs
```

The behaviour. Each case builds a throwaway repository, runs the **real** `cfour`
CLI to set it up, puts a real request to Claude Code with this plugin loaded, and
grades what came back: what it said, which commands it ran, and what the
workspace looks like afterwards. Every case exists because a change in cfourdev
could make the agent decide something wrong — `evals/README.md` explains the
shape of one. It costs a few dollars a pass, so CI does not run it; run it when
the skills change, and when cfourdev does.

## Licence

Free to use, including commercially; do not redistribute outside the
marketplace. **What the plugin writes at your request is yours.** See `LICENSE`.

## References

- Platform — [cfourdev.com.br](https://cfourdev.com.br)
- Documentation — [docs.cfourdev.com.br](https://docs.cfourdev.com.br)
- CLI on npm — [cfour-cli](https://www.npmjs.com/package/cfour-cli)
- The C4 model — [c4model.com](https://c4model.com/)
