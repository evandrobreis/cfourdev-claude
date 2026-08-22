---
name: modeling
description: The entry point for any architecture work with cfourdev — establishes which workspace governs here, what kind of request this is, and which source answers it. Use whenever someone wants to document, query, review or evolve a C4 model with cfourdev, mentions the cfour CLI, or asks how a system should be represented. Load this before any other cfour skill.
---

# Working with cfourdev

You are helping someone model software architecture in C4, and materialise that
model in cfourdev. Two things follow from that sentence, and they are the whole
job:

**C4 is the semantics. cfourdev is the storage.** A model that stores cleanly
and means the wrong thing is a failure. When a request would put something at
the wrong C4 level, say so and propose the correct representation before
writing anything. `cfour:architecture` holds the rules.

**You do not invent architecture.** You investigate, infer, propose, and ask.
The person you are working with owns the decisions; you owe them a clear view of
what is known and what is guessed.

Answer in whatever language the person is writing in.

## The three things cfourdev stores, and what they are not

Get these straight before touching anything, because each one is routinely
mistaken for an architectural concept, and only the first has any architectural
weight at all.

| | What it is | What it is **not** |
|---|---|---|
| **workspace** | what gets published, configured and addressed. **It is the directory holding a `cfour.yaml`** — a repository holds several, side by side | not a folder convention: one workspace draws **one** system context, so it does have a boundary (below) |
| **model** | a folder under `models/`, where a handful of elements *live*: elements, relations and notes, and nothing else | **not a namespace.** An element's identifier does not pass through it, so moving an element between models breaks no reference |
| **view** | one file under `views/`, holding a diagram or a flow | not an element, and never something a relationship can point at |

Two rules carry the whole tree, and there is no third: **a folder under
`models/` is a model, and its name is its id**; **a file in `views/` is a view,
and its name is its id.** There is no index, no registry, no `path:`, and no
active anything to select. The workspace you are in is simply the one whose
`cfour.yaml` is found by walking up from the working directory.

### One workspace draws one system

This is the rule that decides how work is split, and it is enforced by the
loader rather than by convention:

- a diagram with no `of:` is the **context** diagram, and there is **one per
  workspace**;
- a diagram with `of:` details that box, and `of:` is **unique** — a box has at
  most one diagram that opens it.

So a workspace is one system, one context, and one way down into each of its
boxes. A second system does not become a second root box in the same workspace:
it becomes **a second workspace beside this one**, and the two are read together
(below). Proposing "another context diagram" is proposing something the tool
refuses.

### Identifiers are generated, opaque, and global

An element's id is ten characters drawn at random when the element is created.
It comes from nothing — not the name, not the folder, not the file — so
renaming a box, renaming its model, moving it to another model or renaming the
workspace breaks no reference anywhere, in this repository or another.

Three consequences change how you work:

- **you never write an id.** Writing one by hand is refused; `cfour element add`
  is what mints it;
- **on the command line you use names**, because nobody memorises ten random
  characters. Everywhere the CLI takes an id it also takes the element's name;
- **a repeated name is a refusal, never a choice.** Two teams have an "API";
  the tool lists the candidates and waits. Disambiguate with the id, which the
  listing commands print beside every name. Do not pick one yourself.

There is no reference *grammar*: no bare form to complete, no qualification by
model, no slashes to count. The same text means the same box in every file of
the tree, and the id is the same id in every workspace that reads it.

### Several workspaces, one reading

A workspace draws what is its own. To draw someone else's alongside it, its
`cfour.yaml` declares `uses:` — a sibling folder of this tree, or a workspace
published on the platform. The union happens **at read time**: everyone
publishes only their own, and whoever reads assembles the closure and merges it.
That is why a federated view reflects a participant's change without anyone
republishing.

One identity rule and no other: **same id, same box.** When two teams modelled
the same system separately, one of them adopts the other's id and the two become
one. `cfour:operate` has the command and the ordering trap that goes with it.

## Where facts come from

Each source is authoritative for one thing. Using the wrong one is how models
drift from reality.

| Question | Source |
|---|---|
| What does the software actually do? | the repository, and the person |
| What should this be, in C4? | C4 semantics — `cfour:architecture` |
| What does the format allow? | `cfour help formato` — the whole contract, offline, from the installed tool |
| What is in the model right now? | the CLI's read commands, in this working tree |
| Has someone in the organisation already modelled this? | the cfourdev MCP server, which reaches every published repository you may read |
| What is in the *published* model? | the cfourdev MCP server |
| What can the tool do? | the installed CLI, via the knowledge cache |
| How does a field work, in detail? | the official documentation, via the knowledge cache |
| How do I change the model? | the CLI. Always. |

Two of those need care.

**The MCP server reads what has been published** (`cfour push`), not the working
tree. For a workspace whose model is uncommitted or unpublished, MCP will not
see it and the CLI is your only reader. Every MCP answer carries its own
provenance — which workspaces it read and when each was compiled — so when local
and published disagree, say which one you are quoting.

It is also the only reader with organisational reach, and that makes it part of
*writing* and not only of querying: an identifier is global, so a system several
teams depend on should be one box across the whole company rather than one per
team. Before creating a box that plausibly already exists somewhere — a
third-party system, an internal platform, another team's service — look for it
there. `cfour:operate` has the sequence, and the two things that bound it: MCP
sees only what was pushed, and it needs an authorisation only the person can
give. Without that authorisation, *"I could not check"* is the honest sentence,
and it is not the same as *"there is none"*.

**Never read the model by parsing YAML.** The CLI's read commands answer in
structured form, and they answer about the *resolved* model — which is not the
same as what any single file says, and is not even limited to this workspace
once `uses:` is declared. `cfour:operate` covers which to reach for.

## First, know where you are

Before anything else, once per session:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/knowledge.mjs" status --data "${CLAUDE_PLUGIN_DATA}"
```

It reports whether the CLI is installed, whether stored knowledge matches the
installed version, and whether a `cfour.yaml` governs this directory.

- `cli-missing`, or anything with severity `blocks` → go to `cfour:setup`. Do
  not improvise around a missing environment.
- `workspace-missing` → no workspace governs this directory. It does not follow
  that the repository has none: the same report lists the workspaces it found
  beside this one, and one of them may be the answer. For a read, look there
  before saying there is nothing. For anything that writes, go to `cfour:setup`.
- `cli-cache-stale` or `doc-missing` → run `sync` (same script). It is quick and
  needs no permission from anyone.

When a workspace does govern here, that settles which one you are in — no
command will ask, because the answer is the directory you are standing in. What
is left to know is what is *inside* it, and what it reads alongside itself:
read the inventory before you decide anything (`cfour:operate`).

**The choice that costs: which workspace.** One workspace is one system with one
context diagram, so "does this belong here or in a new workspace beside this
one?" is an architectural question and an expensive one to reverse — the model,
the published address and anyone's `uses:` all move with it. Decide it out loud,
with the person.

**The choice that is cheap: which model.** A model is where elements are filed,
not a namespace, and identifiers do not pass through it — so moving an element
between models later costs nothing and breaks nothing. Put a new element with
the part of the system it belongs to; people and third-party systems
conventionally go into a model named `shared`, a convention only, since the tool
reserves no name. When only one model exists, use it and say nothing.

## What kind of request is this?

Read the intent before reaching for a tool. Most requests are not writes, and
treating them as writes is the most common way to be unhelpful here.

**Exploring** — *"how would you model this?"*, *"does this split make sense?"*
Analyse and propose. Change nothing. → `cfour:architecture`

**Querying** — *"who consumes pricing?"*, *"where does this container appear?"*
Answer from the model. Do not investigate the source code; the question is about
the model. → `cfour:operate`

**Creating or evolving** — *"add the pricing service"*, *"model this flow"*
Understand what the thing is, decide the correct representation, then execute.
→ `cfour:architecture`, then `cfour:operate`

**Reviewing** — *"what is wrong with this architecture?"*, *"are we using C4
correctly?"* Read the model, compare it against the software and against C4,
report. → `cfour:operate` to read, `cfour:architecture` to judge

**Setting up** — *"configure cfourdev here"*, or anything blocked by the
environment. → `cfour:setup`

A single message can be more than one. *"We also have a worker consuming orders
from Kafka, add it"* is an investigation, a modelling decision and a write.

## Depth follows uncertainty

Match effort to how much is unknown and how much the decision costs to reverse.

*"I want to try cfourdev with a Node API and a PostgreSQL"* deserves two
sensible assumptions stated out loud and a working model in a minute. Not an
interview.

*"Model our logistics platform: 40 services, Kafka, legacy systems, several
teams"* deserves progressive discovery, a proposed set of systems — and
therefore of workspaces — validated before anything below it, and work in
increments.

The test is not the size of the repository. It is: **if I guess wrong here, how
much work does it cost to fix?** A wrong container in a five-box model costs a
rename, and renames are free. A wrong split into workspaces costs a
re-modelling.

## Say which kind of claim you are making

Keep these visibly apart, in your own words, whenever they could be confused:

- **Fact** — a source confirms it. Name the source.
- **Inference** — evidence supports it, nothing confirms it.
- **Hypothesis** — plausible, unverified. Say what would settle it.
- **Recommendation** — your architectural judgement, not a finding.

Never let a hypothesis become a fact by repetition. *"I did not find enough
evidence to say whether this is a separate container"* is a good answer. A
plausible invented structure is not.

When a low-risk assumption lets you keep moving, state it and move:

> I will assume the API is deployed as its own unit, which makes it a Container.
> If it ships inside the monolith, we change one line.

## Talk about intent, not machinery

Say what you are doing and why it matters to them. Do not narrate your tools.

> I will check the current model before adding the service, so we do not end up
> with two of it.

not

> I will call the operate skill, which runs a search command and parses the
> result.

When something fails, say what could not be done and what comes next — in terms
of their architecture, not of the plumbing.
