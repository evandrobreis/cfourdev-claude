#!/usr/bin/env node
// The behavioural regression suite.
//
// `verify.mjs` proves the mechanical parts work. It cannot prove the only thing
// this plugin is actually for: that an agent carrying these skills reasons about
// cfourdev correctly. Every case here exists because a change in cfourdev could
// make the agent decide something wrong, and a wrong decision here writes a
// model that means something false.
//
// So each case runs Claude Code headless, in a throwaway sandbox, with this
// plugin loaded and the REAL `cfour` CLI on PATH — and then grades what came
// out: what it said, what it ran, and what the workspace looks like afterwards.
//
//   node scripts/eval.mjs                    every case, one run each
//   node scripts/eval.mjs --case identidade  only the cases whose name matches
//   node scripts/eval.mjs --tag federacao    only the cases carrying a tag
//   node scripts/eval.mjs --runs 3           three runs of each, for flakiness
//   node scripts/eval.mjs --list             what exists, without running it
//   node scripts/eval.mjs --plugin-dir <dir>  test another revision of the plugin
//
// A case is a directory under `evals/`:
//
//   prompt.md    what the person says
//   case.json    the fixture, the grading, and why the case exists
//   fixture.sh   optional; builds the sandbox before the agent sees it
//
// The graders are deliberately mechanical — regular expressions over the answer
// and over the commands that ran, plus a shell snippet against the resulting
// workspace. No model grades another model here: a judge that drifts is a suite
// that stops meaning anything, and the failures worth catching are concrete
// enough to be matched.

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const EVALS = path.join(ROOT, 'evals')

// ---------------------------------------------------------------------------
// The cases
// ---------------------------------------------------------------------------

export function loadCases(dir = EVALS) {
  if (!fs.existsSync(dir)) return []
  const cases = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!e.isDirectory() || e.name === 'results') continue
    const base = path.join(dir, e.name)
    const spec = JSON.parse(fs.readFileSync(path.join(base, 'case.json'), 'utf8'))
    cases.push({
      name: e.name,
      dir: base,
      prompt: fs.readFileSync(path.join(base, 'prompt.md'), 'utf8').trim(),
      fixture: fs.existsSync(path.join(base, 'fixture.sh')) ? path.join(base, 'fixture.sh') : null,
      ...spec,
    })
  }
  return cases
}

/**
 * The grader vocabulary, and the whole of it.
 *
 * Each one is a pure function of the run, so a case can be checked against a
 * recorded run without re-running it, and so that adding a grader means adding
 * a line here rather than a mechanism.
 */
/**
 * Accents are folded before matching, on BOTH sides.
 *
 * The agent answers in the language the person wrote in, which here is
 * Portuguese, and it writes "réplica", "não" and "suposição" properly accented.
 * A grader spelled without accents then fails a correct answer, which is the
 * worst kind of test: it reports a regression that is not there, and the next
 * person loosens the pattern until it catches nothing. `cfour find` matches the
 * same way, for the same reason.
 */
export const fold = (text) =>
  (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const matches = (text, pattern, flags = 'is') => new RegExp(fold(pattern), flags).test(fold(text))

export const GRADERS = {
  /** The final answer says this. */
  answer_matches: (run, arg) => matches(run.answer, arg),
  /** The final answer does NOT say this — the shape of most regressions. */
  answer_lacks: (run, arg) => !matches(run.answer, arg),
  /** Some command it ran matches this. */
  ran: (run, arg) => run.commands.some((c) => matches(c, arg, 'i')),
  /** No command it ran matches this. */
  did_not_run: (run, arg) => !run.commands.some((c) => matches(c, arg, 'i')),
  /** It did not edit a file whose path matches this. */
  no_edit_of: (run, arg) => !run.edits.some((f) => new RegExp(arg, 'i').test(f)),
  /** This snippet, run in the sandbox afterwards, exits 0. */
  shell: (run, arg) =>
    spawnSync('bash', ['-c', arg], { cwd: run.sandbox, encoding: 'utf8', timeout: 60_000 })
      .status === 0,
}

export function grade(spec, run) {
  const results = []
  for (const check of spec.expect || []) {
    const [kind, arg] = Object.entries(check).find(([k]) => k in GRADERS) || []
    if (!kind) throw new Error(`unknown grader in ${spec.name}: ${JSON.stringify(check)}`)
    results.push({ kind, arg, why: check.why || '', pass: GRADERS[kind](run, arg) })
  }
  return results
}

// ---------------------------------------------------------------------------
// Running one case
// ---------------------------------------------------------------------------

function sandboxFor(spec) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), `cfour-eval-${spec.name}-`))
  // A git repository, because that is what the plugin looks at to find the
  // workspaces beside the one it is in.
  execFileSync('git', ['init', '-q', base], { stdio: 'ignore' })
  if (spec.fixture) {
    const r = spawnSync('bash', [spec.fixture], { cwd: base, encoding: 'utf8', timeout: 120_000 })
    if (r.status !== 0) {
      throw new Error(`fixture failed for ${spec.name}: ${(r.stderr || r.stdout || '').trim()}`)
    }
  }
  return base
}

/** Pulls the answer, the commands and the file edits out of the stream. */
export function readTranscript(text) {
  const commands = []
  const edits = []
  let answer = ''
  let cost = 0
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    let m
    try {
      m = JSON.parse(line)
    } catch {
      continue
    }
    if (m.type === 'assistant') {
      for (const c of m.message?.content || []) {
        if (c.type !== 'tool_use') continue
        if (c.name === 'Bash' && c.input?.command) commands.push(c.input.command)
        if (['Write', 'Edit', 'NotebookEdit'].includes(c.name)) {
          const f = c.input?.file_path || c.input?.notebook_path
          if (f) edits.push(f)
        }
      }
    }
    if (m.type === 'result') {
      answer = typeof m.result === 'string' ? m.result : ''
      cost = m.total_cost_usd || 0
    }
  }
  return { answer, commands, edits, cost }
}

function runCase(spec, opts) {
  const sandbox = sandboxFor(spec)
  const args = [
    '-p',
    spec.prompt,
    '--plugin-dir',
    opts.pluginDir,
    '--model',
    opts.model,
    '--output-format',
    'stream-json',
    '--verbose',
    '--dangerously-skip-permissions',
  ]
  const r = spawnSync('claude', args, {
    cwd: sandbox,
    encoding: 'utf8',
    timeout: (spec.timeout_seconds || 600) * 1000,
    maxBuffer: 64 * 1024 * 1024,
  })
  const transcript = readTranscript(r.stdout || '')
  // No result message means the run never finished — a timeout, a crash, a
  // missing `claude` on PATH. Grading that as a behavioural failure would blame
  // the plugin for the harness, so it is reported as what it is.
  if (!transcript.answer && !transcript.commands.length) {
    const why = r.error ? r.error.message : `exit ${r.status}, ${(r.stderr || '').trim().slice(0, 200)}`
    throw new Error(`the run produced nothing — ${why}`)
  }
  return { ...transcript, sandbox, keep: opts.keep }
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------

function valueOf(argv, flag, fallback) {
  const i = argv.indexOf(flag)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

async function main() {
  const argv = process.argv.slice(2)
  const opts = {
    model: valueOf(argv, '--model', 'sonnet'),
    runs: Number(valueOf(argv, '--runs', '1')),
    keep: argv.includes('--keep'),
    // Which plugin is under test. It defaults to this one, and points elsewhere
    // when the question is whether a case actually CATCHES something: run it
    // against the previous revision, in a worktree, and a case that passes
    // there was never a regression test.
    pluginDir: path.resolve(valueOf(argv, '--plugin-dir', ROOT)),
  }
  const caseGlob = valueOf(argv, '--case', null)
  const tag = valueOf(argv, '--tag', null)

  let cases = loadCases()
  if (caseGlob) cases = cases.filter((c) => c.name.includes(caseGlob))
  if (tag) cases = cases.filter((c) => (c.tags || []).includes(tag))

  if (argv.includes('--list')) {
    for (const c of cases) {
      process.stdout.write(`${c.name.padEnd(30)}${(c.tags || []).join(",").padEnd(22)}${c.why || ''}\n`)
    }
    return 0
  }
  if (!cases.length) {
    process.stderr.write('no cases matched\n')
    return 1
  }

  let failed = 0
  let spent = 0
  const report = []
  for (const spec of cases) {
    for (let attempt = 1; attempt <= opts.runs; attempt++) {
      const label = opts.runs > 1 ? `${spec.name} (${attempt}/${opts.runs})` : spec.name
      let run, checks
      try {
        run = runCase(spec, opts)
        checks = grade(spec, run)
      } catch (e) {
        process.stdout.write(`FAIL ${label}\n       error: ${e.message}\n`)
        failed++
        continue
      }
      spent += run.cost
      const bad = checks.filter((c) => !c.pass)
      process.stdout.write(`${bad.length ? 'FAIL' : 'ok  '} ${label}\n`)
      for (const c of bad) {
        process.stdout.write(`       ${c.kind}: ${c.arg}\n`)
        if (c.why) process.stdout.write(`         why it matters: ${c.why}\n`)
      }
      if (bad.length) {
        failed++
        process.stdout.write(`       answer: ${run.answer.replace(/\s+/g, ' ').slice(0, 400)}\n`)
        process.stdout.write(`       ran: ${run.commands.join(' | ').slice(0, 400)}\n`)
      }
      // The answer and the commands go into the report, not only onto the
      // screen: a grader that misfires is diagnosed by reading what the agent
      // actually said, and 400 truncated characters is not enough to tell a
      // wrong answer from a wrong pattern.
      report.push({
        case: spec.name,
        attempt,
        pass: !bad.length,
        checks,
        answer: run.answer,
        commands: run.commands,
        edits: run.edits,
      })
      if (!opts.keep) fs.rmSync(run.sandbox, { recursive: true, force: true })
    }
  }

  const total = cases.length * opts.runs
  process.stdout.write(`\n${total - failed}/${total} passed  (about $${spent.toFixed(2)})\n`)
  if (argv.includes('--json')) {
    fs.mkdirSync(path.join(EVALS, 'results'), { recursive: true })
    const out = path.join(EVALS, 'results', 'last.json')
    fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n')
    process.stdout.write(`${path.relative(ROOT, out)}\n`)
  }
  return failed ? 1 : 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      process.stderr.write(`failed: ${err.message}\n`)
      process.exit(1)
    }
  )
}
