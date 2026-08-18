---
name: operate
description: Reads and changes a cfourdev model — answers questions about what is in the model, builds and runs the right cfour CLI commands to create or alter elements, relationships, diagrams, flows and notes, validates the result, opens the local viewer and publishes. Use for any question about what the model currently contains, and for every change to it.
---

# Reading and changing the model

The division is absolute: **the MCP server and the CLI's read commands answer
questions; the CLI's write commands make changes.** Never read the model by
parsing YAML, and never change it by writing YAML.

## Reading

**The working tree — the CLI.** This is the right reader for the repository you
are in, whether or not anything has been published.

- `cfour check --inventory --json` — the whole model at once: projects,
  elements with their levels and parents, counts, and every problem found. The
  first thing to run when you need to know what exists.
- `cfour element list --json`, `cfour relation list --json`,
  `cfour diagram list --json` — filtered listings.
- `cfour element show <ref> --json` — one box, and everyone pointing at it.
- `cfour find <term> --json` — search across ids, names, technologies, tags and
  metadata. Use this before creating anything, to avoid a duplicate.
- `cfour refs <ref> --json` — where a box is used. Use this before removing or
  renaming anything.
- `cfour diagram show <ref> --resolved` — what a diagram's selectors actually
  produce: the boxes, the arrows, and which selector brought each box in. The
  only honest answer to "what will this diagram look like".

**Published models — the MCP server.** Use the `cfourdev` MCP tools when the
question is about what has been published to the platform, and especially when
it concerns a system modelled in a different repository. The server is read-only
and sees `cfour push`ed content, so a working tree that has never been published
is invisible to it — if MCP comes back empty for a model you can see on disk,
that is the reason, and it is worth saying so rather than reporting the model as
missing.

If the MCP tools are not available in the session, the connection has not been
authorised: `cfour:setup` covers that.

## Writing

Every change goes through the CLI. A hook enforces this on file edits, but the
rule is not about the hook — it is that the CLI validates after writing and
rolls back on a new error, and a hand-written file does not.

**Find the command before composing it.** Do not write flags from memory; the
surface changes between releases.

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" cli --data "${CLAUDE_PLUGIN_DATA}"
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" cli element add --data "${CLAUDE_PLUGIN_DATA}"
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" search relacao --data "${CLAUDE_PLUGIN_DATA}"
```

The first lists every runnable command in one screen. The second gives one
command's arguments, options and examples. The third says which command *and*
which documentation block cover a subject. Pull one command at a time; there is
no reason to load the whole surface to add an element.

**Run with `--json`.** Every write command supports it, and the structured
answer says which files changed, why that file was chosen, and any warnings —
including semantic ones such as a container that no diagram can reach. Read the
warnings; they are the tool telling you the model is valid and still incomplete.

**Use `--dry-run` when the change is structural or you are unsure.** It prints
the patch and writes nothing. Worth it for anything that moves, renames or
removes; unnecessary for adding a box you just agreed on.

**One command per decision.** Do not chain a dozen writes and then look. The
CLI's own validation runs per command, so a failure halfway through a chain
leaves you reconstructing what happened.

Two details of the format change how you write, and are easy to get wrong:

- **`--parent` decides the C4 level.** There is no `--level` flag. Getting the
  parent right *is* getting the level right.
- **A reference without a slash is not global.** `loja-api` resolves within the
  declaring project and then in `shared/`. To cross projects, qualify it:
  `estoque/loja-api`. People and third-party systems conventionally live in
  `shared/`.

## When a command fails

Errors carry a stable `code` and often `candidates`. Use them instead of
guessing:

- `element_not_found` with candidates — almost always a reference resolution
  problem. Either the id is misspelled, or it lives in another project and needs
  qualifying.
- A removal refused — something points at the element, and the error lists what.
  Deal with the dependents first, or reconsider the removal.
- An invalid option — the stored knowledge disagrees with the installed CLI.
  Re-sync (`knowledge.mjs sync`) and check the command again before retrying.
  Never work around an unknown flag by editing files.

Report the failure in terms of the model, not of the command line. *"There is no
`pricing` in this project — there is one in `shared`; should I point at that
one?"* is useful. Pasting the stderr is not.

## When the CLI cannot do it

This is a real situation and it has a procedure. Before concluding that a
capability is missing, check the command index and search the documentation —
the surface is wider than it looks, and configuration registries such as arrow
kinds and note kinds are open, meaning `cfour config set` can create new ones
without any code change.

If it genuinely is not there:

1. Say so explicitly, and name the missing capability in the tool's own terms
   — *"there is no command that renames a folder in the sidebar"* — not
   *"I cannot do that"*.
2. Say what it would cost to go around it, and what is lost: a hand edit is not
   validated on write and not rolled back on error.
3. Let them decide. If they choose the hand edit, make the smallest possible
   change, touch one file, and run `cfour check` immediately afterwards.

Do not reach for a file edit because composing the command is harder. That is
the failure this rule exists to prevent.

## Validating, and showing the result

Exit code 0 means the command ran. It does not mean the model says what you
intended.

After a meaningful change, verify semantically: `cfour check --json` for
validity, and then the read command that actually answers the question you were
trying to change — `cfour element show`, or `cfour diagram show --resolved` when
the change was supposed to alter a drawing. Confirm what changed in one line, in
their terms.

`cfour serve` opens the local viewer, which is the fastest way for someone to
see whether the model matches what they had in their head. Offer it after
building something substantial. Dragging boxes there saves positions under
`.layout/`.

Publishing is `cfour push`, and it publishes models whose status is `active`.
Use `--dry-run` first when it is the first push from a repository.
