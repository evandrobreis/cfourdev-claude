# The behavioural regression suite

`scripts/verify.mjs` proves the mechanical parts of this plugin work. It cannot
prove the thing the plugin is for: that an agent carrying these skills reasons
about cfourdev correctly.

Every case here exists because **a change in cfourdev could make the agent
decide something wrong**, and a wrong decision writes a model that means
something false. That is the admission test for a new case — not "is this
covered", but "would this catch a regression a person would not notice".

```sh
node scripts/eval.mjs --list          what exists, and why
node scripts/eval.mjs                 all of it, one run each
node scripts/eval.mjs --case adopt    one of them
node scripts/eval.mjs --runs 3        three runs, when a case looks flaky
```

Each run builds a throwaway git repository, applies the case's `fixture.sh`
against the **real** `cfour` CLI, runs Claude Code headless with this plugin
loaded, and grades three things: what it said, which commands it ran, and what
the workspace looks like afterwards.

## A case

```
evals/<name>/
  prompt.md    what the person says
  case.json    why the case exists, and how it is graded
  fixture.sh   optional; builds the workspace before the agent sees it
```

`case.json` carries `why` — the regression the case defends against — and
`expect`, a list of graders. The vocabulary is small on purpose:

| | |
|---|---|
| `answer_matches` / `answer_lacks` | a regular expression over the final answer |
| `ran` / `did_not_run` | over the shell commands the agent executed |
| `no_edit_of` | over the paths it tried to Write or Edit |
| `shell` | a snippet run in the sandbox afterwards; it must exit 0 |

No model grades another model. A judge that drifts is a suite that stops meaning
anything, and the failures worth catching are concrete enough to match: a
command that should have run, a file that should not have been touched, a
workspace that should be in a particular state.

The cost is real — a full pass is a few dollars of API usage — so this is not
part of `verify`, and CI does not run it. Run it when the skills change, and
when cfourdev does.
