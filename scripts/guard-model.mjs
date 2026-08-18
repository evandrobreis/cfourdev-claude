#!/usr/bin/env node
// PreToolUse guard: keeps the model's YAML out of reach of direct edits.
//
// "The CLI is the write interface" is the plugin's load-bearing rule, and a
// rule that lives only in prose is a rule a model can talk itself out of. This
// hook makes it mechanical: any Write/Edit aimed at a file that belongs to a
// cfourdev model escalates to the user instead of just happening.
//
// It ESCALATES rather than blocks, because the rule has a legitimate exception:
// when the CLI genuinely cannot express something, editing by hand is the
// correct move. The exception simply has to be a decision someone makes on
// purpose, with the reason on screen — not a shortcut taken quietly because it
// was easier than reading `--help`.
//
// Any failure here exits 0. A broken guard must never stand between someone and
// their own files.

import fs from 'node:fs'
import path from 'node:path'

/** Which command owns each kind of file. Sending people to the right one is
 *  most of what makes the guard useful rather than merely obstructive. */
function classify(file, modelRoot) {
  const rel = path.relative(modelRoot, file).split(path.sep)
  if (rel[0] === '.layout') {
    return {
      kind: 'layout',
      owner: 'the viewer writes .layout/ when you drag boxes in `cfour serve`',
    }
  }
  if (rel.length === 1 && rel[0] === 'modelagem.yaml') {
    return { kind: 'identity', owner: '`cfour modelagem set`' }
  }
  if (rel[0] !== 'model') return null
  const inside = rel.slice(1)
  if (inside.length === 1 && inside[0] === 'workspace.yaml') {
    return { kind: 'workspace', owner: '`cfour config set`, `cfour config rm`, `cfour config title`' }
  }
  if (inside[inside.length - 1] === 'project.yaml') {
    return { kind: 'project', owner: '`cfour project add`, `cfour project set`' }
  }
  return {
    kind: 'model',
    owner:
      '`cfour element`, `cfour relation`, `cfour diagram`, `cfour flow`, ' +
      '`cfour step`, `cfour path`, `cfour note`, `cfour group`',
  }
}

/** Walks up looking for the directory that holds a `modelagem.yaml`: that
 *  directory is one modelling. Structural, so it needs no YAML parsing. */
function modellingRootOf(file) {
  let dir = path.dirname(path.resolve(file))
  for (;;) {
    if (fs.existsSync(path.join(dir, 'modelagem.yaml'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

function targetOf(payload) {
  const input = payload.tool_input || {}
  return input.file_path || input.notebook_path || null
}

function ask(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: reason,
      },
    }) + '\n'
  )
  process.exit(0)
}

async function main() {
  const chunks = []
  for await (const c of process.stdin) chunks.push(c)
  const payload = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')

  const file = targetOf(payload)
  if (!file) process.exit(0)
  const resolved = path.resolve(file)

  if (path.basename(resolved) === 'cfour.yaml') {
    ask(
      'This is the cfourdev registry, which the CLI writes: `cfour init` creates it, ' +
        '`cfour modelagem add|set|use` changes it. Editing it by hand can leave the ' +
        'registry and the models on disk disagreeing. Only go ahead if the CLI has no ' +
        'command for what is needed here — and say which one is missing.'
    )
  }

  const root = modellingRootOf(resolved)
  if (!root) process.exit(0)
  const verdict = classify(resolved, root)
  if (!verdict) process.exit(0)

  if (verdict.kind === 'layout') {
    ask(
      `This file holds diagram positions, and ${verdict.owner}. Editing it by hand is ` +
        'usually a mistake: the next drag overwrites it.'
    )
  }

  ask(
    `This file belongs to the cfourdev model in ${path.basename(root)}/, and the CLI owns ` +
      `writing it: ${verdict.owner}. The CLI validates after writing and rolls back on a new ` +
      'error, which a hand edit does not. Only edit it directly if the CLI genuinely cannot ' +
      'express this — and if so, say which capability is missing, keep the change minimal, ' +
      'and run `cfour check` afterwards.'
  )
}

main().catch(() => process.exit(0))
