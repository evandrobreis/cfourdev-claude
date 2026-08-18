---
name: operate
description: Reads and changes a cfourdev workspace — answers questions about what the model contains, builds and runs the right cfour CLI commands to create or alter elements, relations, diagrams, flows, groups and notes, validates the result, opens the local viewer and publishes. Use for any question about what the model currently contains, and for every change to it.
---

# Reading and changing the model

The division is absolute: **the MCP server and the CLI's read commands answer
questions; the CLI's write commands make changes.** Never read the model by
parsing YAML, and never change it by writing YAML.

## Reading

**The working tree — the CLI.** This is the right reader for the repository you
are in, whether or not anything has been published.

Do not memorise the catalogue; decide what you need to know, then reach for the
command that answers it.

| What you need to know | Reach for |
|---|---|
| everything at once, before deciding anything | `cfour check --inventory --json` — the whole resolved model: the models, every element with its level and parent, the relations, the views, the vocabulary in use, and every problem found |
| does this already exist, under any name | `cfour find` — matches ids, names, descriptions, tags, metadata and note text. Run it before creating anything |
| what breaks if this changes or goes | `cfour refs` — everywhere a box is used. Run it before removing or renaming |
| one box, in full | `cfour element show` |
| what a diagram will actually draw | `cfour diagram show` with `--resolved` — the boxes, the arrows, and which selector brought each box in. The only honest answer to "what will this look like" |
| which values are legal here | `cfour config show` — shapes, relation kinds, note kinds and outcomes are open registries, so the valid set is per workspace, not universal |
| who this workspace is | `cfour workspace show`; `cfour model list` for what is inside it |

The listing commands (`element list`, `relation list`, `diagram list`,
`flow list`, `note list`) take filters and are the right call once you know what
you are narrowing to. `--json` throughout, always.

`cfour check` on its own is the validity question, and it distinguishes what it
refuses from what it merely warns about. The warnings are the useful part: a
container no view can reach is valid and still invisible.

**Published workspaces — the MCP server.** Use the `cfourdev` MCP tools when the
question is about what has been published to the platform, and especially when
it concerns a system modelled in a different repository. The server is read-only
and sees `cfour push`ed content, so a working tree that has never been published
is invisible to it — if MCP comes back empty for a model you can see on disk,
that is the reason, and it is worth saying so rather than reporting the model as
missing. Its vocabulary is the same three concepts: workspaces, and the models
and views inside them.

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
which documentation page cover a subject. Pull one command at a time; there is
no reason to load the whole surface to add an element.

**Run with `--json`.** Every write command supports it, and the structured
answer says which files changed, why that file was chosen, and any warnings.
Read the warnings; they are the tool telling you the model is valid and still
incomplete. You do not choose the file a change lands in — the tool decides, and
always the same way.

**Use `--dry-run` when the change is structural or you are unsure.** It prints
the patch and writes nothing. Worth it for anything that moves, renames or
removes; unnecessary for adding a box you just agreed on.

**One command per decision.** Do not chain a dozen writes and then look. The
CLI's own validation runs per command, so a failure halfway through a chain
leaves you reconstructing what happened.

Three properties of the format change *how* you write, and are easy to get
wrong:

- **`--parent` decides the C4 level.** There is no `--level` on an element. The
  level is derived from depth in the containment tree: a box with no parent is a
  root, hence a system. Getting the parent right *is* getting the level right.

- **A reference resolves by counting slashes, and there is no fallback.** `api`
  is the `api` of the model that declares it, and nothing else — it does not
  fall back to another model, and no folder name is reserved. `vendas/api`
  crosses to another model of this workspace. Inside a file under `views/` the
  bare form does not exist at all, because a view belongs to no model: every
  reference a view makes is qualified. The three-segment form
  `<workspace>/<model>/<id>` exists only for a mirror, which is how a box in
  another workspace is reached.

- **A view selects; it does not list.** A view stores a question — the box it
  details, plus include, exclude and filter criteria — and the viewer answers it
  on every read. So a new container appears in its system's view by itself, with
  nothing to update. Writing an explicit membership list produces a drawing that
  is correct the day it is written and wrong afterwards: when someone asks for
  "a diagram with exactly these six boxes", ask what the six have in common, and
  write that criterion instead.

## When a command fails

Errors carry a stable `code` and often `candidates`. Use them instead of
guessing:

- an element not found, with candidates — almost always a reference resolution
  problem. Either the id is misspelled, or it lives in another model and needs
  qualifying.
- a removal refused — something points at the element, and the error lists what.
  Deal with the dependents first, or reconsider the removal.
- an invalid option — the stored knowledge disagrees with the installed CLI.
  Re-sync (`knowledge.mjs sync`) and check the command again before retrying.
  Never work around an unknown flag by editing files.

Report the failure in terms of the model, not of the command line. *"There is no
`pricing` in this model — there is one in `shared`; should I point at that
one?"* is useful. Pasting the stderr is not.

## When the CLI cannot do it

This is a real situation and it has a procedure. Before concluding that a
capability is missing, check the command index and search the documentation —
the surface is wider than it looks, and the configuration registries are open,
meaning new shapes, relation kinds, note kinds and outcomes can be created
without any code change.

If it genuinely is not there:

1. Say so explicitly, and name the missing capability in the tool's own terms
   — not *"I cannot do that"*.
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
trying to change — `cfour element show`, or a diagram shown `--resolved` when
the change was supposed to alter a drawing. Confirm what changed in one line, in
their terms.

`cfour serve` opens the local viewer, which is the fastest way for someone to
see whether the model matches what they had in their head. Offer it after
building something substantial. Dragging boxes there saves positions under
`layouts/`, which is the tool's file to write and not yours.

Publishing is `cfour push`, and it publishes this workspace when its status is
`active`. Use `--dry-run` first when it is the first push from a repository.
