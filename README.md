# cfourdev for Claude Code

[cfourdev](https://cfourdev.com.br) keeps software architecture documented as a
C4 model that lives in your repository: YAML in an open format, versioned and
reviewed alongside the code, with the diagrams as a consequence of the model
rather than a separate artefact.

This plugin is the modelling partner for it. You describe your system in your
own words; it works out what the system actually is, decides how that should be
represented in C4, and materialises the decision through the `cfour` CLI.

```
Set cfourdev up in this project.
Read this repository and propose how we should model it.
We also have a worker consuming orders from Kafka — add it.
Does this split into containers make sense?
Who depends on the pricing container?
Deepen this container into components.
```

## What it is for

**C4 first, cfourdev second.** The plugin is a C4 modelling tool that happens to
store its results in cfourdev. If you ask for something to be represented at a
level where it does not belong — a folder as a container, a team as a boundary,
an environment as an element — it says so, explains what you are actually trying
to represent, and proposes the correct form. A model that stores cleanly and
means the wrong thing is the failure it is built to prevent.

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
| **the cfourdev MCP server** | reading models published to the platform |

Two rules follow, and the plugin holds to both.

**Writes go through the CLI.** Not because YAML is hard, but because the CLI
validates after writing and rolls back on a new error, and a hand edit does not.
A hook enforces this: an edit aimed at a model file stops and asks, naming the
command that owns that file. The exception is real — when the CLI genuinely
cannot express something, editing by hand is correct — but it stays a decision
someone makes on purpose, with the reason on screen.

**Capabilities are discovered, never memorised.** The plugin does not carry a
copy of the CLI's manual. It reads the command tree from the CLI you have
installed, and the format documentation from the official source, and caches
both — then serves one command or one topic at a time. When the CLI version
changes, the cache notices and refreshes itself. Even the documentation's
address is discovered rather than hardcoded, so the docs can move without a
release here.

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
model registry, and tells you what — if anything — is left for you to do. The
MCP server ships configured; authorising it takes one browser round-trip through
`/mcp`, and is only needed to read models published to the platform. Working
locally needs nothing beyond the CLI.

To update:

```
/plugin marketplace update cfourdev
/plugin update cfour@cfourdev
```

## What is in the box

| | |
|---|---|
| `skills/modeling` | the entry point: which model is active, what kind of request this is, which source answers it |
| `skills/setup` | installs and configures until the environment works |
| `skills/architecture` | understands the software, decides the C4 representation, proposes and reviews |
| `skills/operate` | reads the model, builds and runs CLI commands, validates the result |
| `agents/investigator` | sweeps a large repository for evidence, and deliberately does not classify it |
| `scripts/knowledge.mjs` | the cache: discovers, slices and serves the CLI surface and the documentation |
| `scripts/guard-model.mjs` | the hook that keeps model files behind the CLI |
| `.mcp.json` | the cfourdev MCP server, pre-configured |
| `settings.json` | pre-approves the CLI's **read-only** commands, so discovery and validation do not interrupt you. Every command that writes still goes through the normal permission prompt. |

## Requirements

- The CLI: `npm i -g cfour-cli` — setup offers to do this
- Node 18 or later, for the plugin's own scripts
- A cfourdev account, only if you want to publish

## Development

```
node --test scripts/verify.mjs
```

The tests cover the mechanical parts: slicing the documentation, cache
invalidation, the guard's verdicts, and the plugin's own shape. They also check
that the prose has not quietly re-embedded knowledge the plugin is supposed to
discover — a hardcoded documentation address, or a CLI flag written down where
it will go stale.

What they cannot cover is behaviour. Whether the plugin actually refuses a wrong
C4 level, or actually asks instead of guessing, is only measurable by using it.

## Licence

Free to use, including commercially; do not redistribute outside the
marketplace. **What the plugin writes at your request is yours.** See `LICENSE`.

## References

- Platform — [cfourdev.com.br](https://cfourdev.com.br)
- CLI on npm — [cfour-cli](https://www.npmjs.com/package/cfour-cli)
- The C4 model — [c4model.com](https://c4model.com/)
