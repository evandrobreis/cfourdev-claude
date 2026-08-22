---
name: architecture
description: Understands the software being documented and decides how it should be represented in C4 — investigates the repository and the business context, proposes the model structure, and reviews an existing model for gaps, wrong levels and missing relationships. Use when someone asks how a system should be modelled, wants a system context or containers proposed, wants an architecture critiqued, or asks for something that may not belong at the C4 level they named.
---

# Deciding what the model should say

Two failures are possible here, and they are not symmetrical. Modelling the
wrong thing wastes an afternoon. Modelling the right thing at the wrong level
produces a diagram that everyone believes and nobody can use. Guard against the
second one first.

The order is always: **understand the software → decide the C4 representation →
propose → only then write.**

## Understanding comes before classifying

Investigate to answer questions, not to inventory files. Before opening
anything, know what you are trying to settle — *is the worker deployed
separately from the API?* is a question; *let me look at the repo* is not.

Useful sources, roughly in order of how much they settle per minute spent:

- **README, ADRs, architecture docs** — intent, which the code never states
- **Deployment and infrastructure** — Dockerfiles, compose files, Kubernetes
  manifests, Terraform, CI pipelines. These answer *what is a separately
  deployable unit*, which is the single most load-bearing question in C4
- **Manifests and dependency files** — technologies, and which components talk
  to which
- **Configuration** — connection strings, queue names, and base URLs of other
  systems reveal the boundaries the code does not draw
- **The person** — everything above tells you what exists, not what it is for

**Delegate a broad sweep.** When the repository is large, or spans several
services, use the `investigator` agent: give it the specific questions, and it
returns evidence with file paths instead of filling this conversation with file
contents. It deliberately does not classify anything into C4 — that decision
stays here, where the C4 rules are.

For a small repository, just look. Spawning an agent to read four files is
slower than reading them.

## The code is not enough

Directory structure is not architecture. `services/foo` is evidence that
somebody made a folder, and nothing more. Before treating a folder as a
Container, something must say it is deployed, runs, or scales on its own.

These do not come from the code, and are worth one question each when they
change the model:

- What is this software for, in business terms?
- Who uses it — which real roles, not which auth tables?
- Which of the surrounding systems are ours and which are third parties?
- Who owns each part?
- Which boundaries are real, and which are just how the repository is laid out?

Ask few, and only where the answer changes what you would write. Anything the
repository, the CLI or the MCP server can answer, do not ask a person.

## C4 semantics are not negotiable

When a request would place something at a level where it does not belong, do not
find a way to make it fit. Read `references/c4.md` — it holds the level
definitions, the failure patterns, and what to do with a concept that is real
but is not an element at any level.

The shape of the answer is always the same:

1. Say plainly what does not fit, and why.
2. Name what they are actually trying to represent.
3. Propose the representation that is correct in C4.
4. If the concept is real but is not a box, propose how cfourdev carries it
   anyway — tags, metadata, relations, notes, groups, flows, another model, or
   another workspace.

Then let them decide. They may have a reason you do not know, and it is their
model. What you must not do is quietly produce a structurally valid model that
means something false.

One rule of the tool matters here, because it changes how you write rather than
only what you write: **in cfourdev the C4 level is derived from the containment
tree, not declared.** An element with no `parent` is a system; a child of a
system is a container; a child of a container is a component. So `--parent` is
the modelling decision, and there is no `--level` flag to disagree with it.

## What cfourdev stores is not what C4 means

cfourdev has three concepts — workspace, model, view — and two of the three are
storage. Keeping storage out of the architecture is part of this skill's job,
because the storage shape is exactly what leaks into a proposal when nobody is
watching:

- a **model** is where elements are filed: a folder under `models/`. It is not a
  level, not a subsystem, not a boundary, and — since an element's identifier
  does not pass through it — not even a namespace. Splitting into two models
  changes which folder a box lives in and nothing else. Nothing breaks, and
  nothing means anything different;
- a **view** is a drawing. It is not an element, and nothing in the model points
  at one.

**The workspace is the exception, and it is load-bearing.** A workspace has
exactly one context diagram, and the tool refuses a second — so one workspace is
one system. That makes "is this one system or two?" a real C4 question with a
storage consequence: two systems are two workspaces, created side by side and
read together through `uses:`. It is not an escape hatch for a concept that does
not fit a level; it is the answer to one question and one only, *is this a
separate system that someone owns as a whole?*

So never answer an architectural question with a filing move. *"Put it in
another model"* is not a representation for a concept that does not fit C4. And
*"put it in another workspace"* is right only when the thing genuinely is
another system — never to make room for a second diagram, a second audience or a
second cut of the same boxes.

## Proposing a structure

For anything beyond a couple of boxes, propose before you build. Keep the
proposal in the language of their system, and make it answerable:

- the systems, and which are ours versus third-party — and, when more than one
  of them is ours, that each is a workspace of its own, side by side, read
  together
- the people and external actors
- for each system worth opening, its containers, with the reason each is a
  container — deployed separately, scales separately, is written in a different
  technology, holds its own state
- the relationships that carry meaning, and what flows across them
- which diagrams are worth having, and which are not
- what you are assuming, marked as assumption
- what you could not determine

Say what you would *not* model, and why. Component diagrams for every container
is a common and expensive mistake: they earn their place where the internal
structure is genuinely non-obvious and stable enough to survive the next sprint.

Which diagrams exist is barely a choice, and that is worth knowing before you
promise one: a workspace has one context diagram, and any box may have one
diagram that opens it. So the question is never *how many diagrams of this box*
— it is *is this box worth opening at all*. A second perspective on boxes that
already have a diagram is criteria, grouping or colouring inside it, or a flow.

**Work in increments for anything large.** Context first, and validated, before
containers. Containers validated before components. Each round uses the existing
model as its input — read it, do not rebuild it from memory.

## Reviewing an existing model

Read the model first (`cfour:operate`), then compare it against three things:
the software as it actually is, C4 semantics, and its own internal consistency.

Worth reporting when you find it:

- levels used wrongly — the most valuable finding, and the least visible
- boxes whose responsibility cannot be stated in one sentence
- relationships that exist in the code and not in the model, and the reverse
- systems drawn as ours that are third-party, or the reverse
- containers with no relationships at all, which usually means something is
  missing rather than that something is isolated
- content unreachable from any diagram — `cfour check` reports this itself
- boundaries that follow team structure rather than the software
- decisions the model implies but never states, which belong in a note

Report each with its kind marked: fact, inference, hypothesis, recommendation.
A review that mixes them is a review nobody can act on.
