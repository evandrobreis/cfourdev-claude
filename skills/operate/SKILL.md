---
name: operate
description: Reads and changes a cfourdev workspace — answers questions about what the model contains, builds and runs the right cfour CLI commands to create or alter elements, relations, diagrams, flows, groups and notes, validates the result, reads workspaces alongside each other, opens the local viewer and publishes. Use for any question about what the model currently contains, and for every change to it.
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
| everything at once, before deciding anything | `cfour check --inventory --json` — the whole resolved reading: the models, every element with its level and parent, the relations, the views, the vocabulary in use, and every problem found |
| does this already exist, under any name | `cfour find` — matches ids, names, descriptions, tags, metadata and note text. Run it before creating anything |
| what breaks if this changes or goes | `cfour refs` — everywhere a box is used. Run it before removing something; renaming needs no such check |
| one box, in full | `cfour element show` |
| what a diagram will actually draw | `cfour diagram show` with `--resolved` — the boxes, the arrows, and which criterion brought each box in. The only honest answer to "what will this look like" |
| which values are legal here | `cfour config show` — shapes, relation kinds, note kinds and outcomes are open registries, so the valid set is per workspace, not universal |
| who this workspace is | `cfour workspace show`; `cfour model list` for what is inside it |
| which other workspaces this one reads | `cfour uses list` |
| the format's own rules, without the network | `cfour help formato` — anatomy, identifiers, `uses:`, how a view selects, and the guarantees of a write |

The listing commands (`element list`, `relation list`, `diagram list`,
`flow list`, `note list`) take filters and are the right call once you know what
you are narrowing to. `--json` throughout, always. `element list` is also where
you get an id when a name turns out to be ambiguous.

**Read the shape of `check`, not just its exit code.** It answers as a list of
workspaces, because a reading can span more than one, and each entry carries its
own counts, its own problems, and — when `uses:` is declared — a federation
block saying how many participants entered, how many boxes are shared and how
many arrows cross between them. Zero crossings with several participants is the
tool telling you the drawing is islands side by side, not one system.

`cfour check` on its own is the validity question, and it distinguishes what it
refuses from what it merely warns about. The warnings are the useful part: a
container no view can reach is valid and still invisible.

**Published workspaces — the MCP server.** Use the `cfourdev` MCP tools when the
question is about what has been published to the platform, and especially when
it concerns a system modelled in a different repository. The server is read-only
and sees `cfour push`ed content, so a working tree that has never been published
is invisible to it — if MCP comes back empty for a model you can see on disk,
that is the reason, and it is worth saying so rather than reporting the model as
missing. Every answer carries provenance: which workspaces were read, and when
each was compiled. Quote it when local and published could differ, instead of
presenting either as simply "the model". Boxes are addressed there by the same
generated id they have on disk.

If the MCP tools are not available in the session, the connection has not been
authorised: `cfour:setup` covers that.

## Writing

Every change goes through the CLI. A hook enforces this on file edits, but the
rule is not about the hook — it is that the CLI validates after writing and
rolls back on a new error, and a hand-written file does not.

**Creating is the last step, not the first.** A model stays consistent because
each new box was checked against what already exists — here, and then in the
organisation — before it was minted. In order:

1. `cfour find` — is it already in this workspace, or in one this workspace
   reads? Names, descriptions, tags and note text, so a box called something
   slightly different still turns up.
2. the MCP server — has another team already published it? Below.
3. only then `cfour element add`, and validate afterwards.

Skipping step 1 duplicates a box inside one drawing, which someone notices.
Skipping step 2 duplicates it across the company, which nobody does.

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

**Name things; never invent an id.** Every command that takes an id also takes
the element's name, and that is how you write them, because ids are generated
and nobody types ten random characters. When a name matches more than one box
the command refuses and lists the candidates — that refusal is correct, and the
answer is to pass the id from the listing, not to guess which one was meant.
Writing an id yourself is refused outright.

**Run with `--json`** on everything that touches the model. The structured
answer says which files changed, why that file was chosen, and any warnings.
Read the warnings; they are the tool telling you the model is valid and still
incomplete. You do not choose the file a change lands in — the tool decides, and
always the same way. The commands that talk to the platform or to a browser
(`push`, `pull`, `serve`, and the credential commands) are the exception and
answer as text.

**Use `--dry-run` when the change is structural or you are unsure.** It prints
the patch and writes nothing. Worth it for anything that moves, renames or
removes; unnecessary for adding a box you just agreed on.

**One command per decision.** Do not chain a dozen writes and then look. The
CLI's own validation runs per command, so a failure halfway through a chain
leaves you reconstructing what happened.

Four properties of the format change *how* you write, and are easy to get wrong:

- **`--parent` decides the C4 level.** There is no `--level` on an element. The
  level is derived from depth in the containment tree: a box with no parent is a
  root, hence a system. Getting the parent right *is* getting the level right.

- **Renaming and refiling are free.** An id comes from nothing, so renaming a
  box, renaming a model or moving an element between models rewrites no
  reference and loses no diagram arrangement. Never propose recreating something
  in order to rename it.

- **A view selects; it does not list.** A view stores a question — the box it
  details, plus include, exclude and filter criteria — and the viewer answers it
  on every read. So a new container appears in its system's view by itself, with
  nothing to update. Writing an explicit membership list produces a drawing that
  is correct the day it is written and wrong afterwards: when someone asks for
  "a diagram with exactly these six boxes", ask what the six have in common, and
  write that criterion instead.

- **A box has one diagram, and a workspace has one context.** The diagram with
  no `of:` is the context diagram and there is one per workspace; `of:` is
  unique, so a box has at most one diagram that opens it. Both second attempts
  are refused. When someone wants another cut of the same boxes, the answer is
  criteria, grouping or colouring inside the diagram that already exists — or a
  flow, which is a different kind of view and is not subject to either rule.
  When they want another system, the answer is another workspace beside this
  one.

### Before creating a box that someone may already have

Three readers, three ranges, and they are not interchangeable. Using the
narrowest one and concluding "it does not exist" is how the same system ends up
modelled four times in one organisation.

| Range | Reader |
|---|---|
| this working tree, plus everything it already reads | `cfour find` |
| everything published across the organisation, in every repository you may read | the MCP server — `cfour_search` for a name or a selector, `cfour_catalog` for which workspaces exist at all, `cfour_get` for one box in full |
| what nobody has modelled yet | the person |

**For anything plausibly already modelled by someone else, check the
organisation before minting a new box.** Third-party systems, internal
platforms, another team's service, an actor several products share — these are
exactly what global identifiers exist to keep single. A duplicate costs nothing
to create and is expensive to notice later: the two draw as two boxes, no arrow
ties them, and each team keeps maintaining its own.

When it does exist elsewhere, discovery is only the first step — **finding a box
in the MCP server brings nothing into this model.** The rest is the CLI:

1. **Find it** — `cfour_search` gives the box and its id; `cfour_get` gives the
   whole box, including how the owning team describes it.
2. **Read it here** — `cfour uses add <org>/<repo>` (optionally naming the
   workspace), then `cfour pull`. Only now can a diagram of this workspace draw
   it.
3. **If you had already modelled it yourself**, the two are still two boxes.
   Adopt the id so they become one, minding the ordering above.
4. **If you had not**, create it adopting that id from the start, rather than
   creating your own and reconciling afterwards.

Two conditions bound all of this, and both belong in what you say:

- the server sees only what was pushed. A box another team has on disk and has
  not published is invisible, and its absence proves nothing;
- the connection needs an authorisation only the person can give. Without it the
  `cfourdev` tools are simply not in the session — and then the honest sentence
  is *"I could not check whether the organisation already has one"*, which is
  not the same sentence as *"there is none"*. Offer `cfour:setup` and let them
  decide whether it is worth doing now.

### Reading another workspace alongside this one

`cfour uses` declares what this workspace reads with it: a sibling folder of
this tree, or a workspace published on the platform. For a published one,
`cfour pull` downloads it once into a cache the workspace keeps, and after that
`check` and `serve` need no network. Both the cache and its lock file belong to
`pull`; do not edit either.

You can only write inside your own workspace. A command aimed at an element that
came in through `uses:` is refused as being outside this workspace, and that is
the intended answer, not an obstacle — the change belongs to whoever owns that
workspace.

To make two separately-modelled boxes one box, `cfour element adopt` gives the
local one the other's id. **Order matters, and getting it wrong looks like a
tool failure:** adopt is refused when the id is already visible here, which is
exactly what `uses:` does. So adopt first and declare `uses:` afterwards; if
`uses:` is already there, drop it, adopt, and put it back. After that, `check`
should show the shared box counted and arrows crossing.

## When a command fails

Errors carry a stable `code` and often `candidates`. Use them instead of
guessing:

- an element not found — check the name against `cfour element list` before
  assuming the box is missing; the starter model's boxes are not named after the
  workspace.
- an ambiguous reference, with candidates — two boxes share that name. Pass the
  id of the one you mean; do not pick for the person when the choice is
  architectural.
- a duplicate diagram — you are asking for a second context, or a second diagram
  of a box that already has one. Re-read the rule above; the model needs a
  different answer, not a retry.
- a removal refused — something points at the element, and the error lists what.
  Deal with the dependents first, or reconsider the removal.
- an invalid option — the stored knowledge disagrees with the installed CLI.
  Re-sync (`knowledge.mjs sync`) and check the command again before retrying.
  Never work around an unknown flag by editing files.

Report the failure in terms of the model, not of the command line. *"There are
two boxes called `API` — the one in billing and the one in checkout; which did
you mean?"* is useful. Pasting the stderr is not.

## When the CLI cannot do it

This is a real situation and it has a procedure. Before concluding that a
capability is missing, check the command index, read `cfour help formato`, and
search the documentation — the surface is wider than it looks, and the
configuration registries are open, meaning new shapes, relation kinds, note
kinds and outcomes can be created without any code change.

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
see whether the model matches what they had in their head. One server covers the
whole tree: the sibling workspaces are listed for the reader to switch between,
and each is drawn with everything it reads, so a federated reading is visible
there too — with a provenance block naming where the boxes came from. Offer it
after building something substantial. Dragging boxes there saves positions under
`layouts/`, which is the tool's file to write and not yours.

Publishing is `cfour push`, and it publishes this workspace when its status is
`active`. The target is the repository named in its own `cfour.yaml`, which is
also what a stored key grants access to — so sibling workspaces of one tree
publish with one key, and each is pushed from its own directory. Use
`--dry-run` first when it is the first push from a repository.
