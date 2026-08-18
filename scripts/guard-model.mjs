#!/usr/bin/env node
// PreToolUse guard: keeps a workspace's files out of reach of direct edits.
//
// "The CLI is the write interface" is the plugin's load-bearing rule, and a
// rule that lives only in prose is a rule a model can talk itself out of. This
// hook makes it mechanical: any Write/Edit aimed at a file that belongs to a
// cfourdev workspace escalates to the user instead of just happening.
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

/**
 * Which command owns each kind of file. Sending people to the right one is most
 * of what makes the guard useful rather than merely obstructive.
 *
 * The structure this reads is the whole of cfourdev's on-disk shape, and it has
 * no fourth rule:
 *
 *   cfour.yaml            the workspace: identity and appearance
 *   models/<model>/*.yaml elements, relations and notes
 *   views/<view>.yaml     one diagram or one flow per file
 *   layouts/<view>.json   the arrangement, written by the viewer
 *
 * Anything else under the workspace root is the software being documented, and
 * is none of this hook's business.
 */
function classify(file, root) {
  const rel = path.relative(root, file).split(path.sep)
  if (rel[0] === '..' || path.isAbsolute(rel[0])) return null

  if (rel.length === 1 && rel[0] === 'cfour.yaml') {
    return {
      what: 'the workspace itself — its identity and its appearance',
      owner: '`cfour workspace set` for identity, `cfour config set|rm|title` for appearance',
    }
  }
  if (rel[0] === 'models' && rel.length > 1 && rel.at(-1).endsWith('.yaml')) {
    return {
      what: `the model \`${rel[1]}\`: its elements, relations and notes`,
      owner: '`cfour element`, `cfour relation`, `cfour note`, `cfour model`',
    }
  }
  if (rel[0] === 'views' && rel.length === 2 && rel[1].endsWith('.yaml')) {
    return {
      what: `the view \`${rel[1].replace(/\.yaml$/, '')}\` — a diagram or a flow`,
      owner:
        '`cfour diagram` and `cfour group` for a diagram; ' +
        '`cfour flow`, `cfour step` and `cfour path` for a flow',
    }
  }
  if (rel[0] === 'layouts' && rel.length === 2 && rel[1].endsWith('.json')) {
    return {
      what: 'where the boxes of a diagram sit',
      owner: 'the viewer writes `layouts/` when you drag boxes in `cfour serve`',
      transient: true,
    }
  }
  return null
}

/**
 * The workspace root: the directory holding `cfour.yaml`, found by walking up,
 * exactly as every `cfour` command does. One workspace per repository, so this
 * is the entire question of context — there is nothing to select.
 */
function workspaceRootOf(file) {
  let dir = path.dirname(path.resolve(file))
  for (;;) {
    if (fs.existsSync(path.join(dir, 'cfour.yaml'))) return dir
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

  // A `cfour.yaml` being created is the file that makes a workspace exist, so
  // walking up would not find it yet. It is `cfour init` that writes it.
  if (path.basename(resolved) === 'cfour.yaml' && !fs.existsSync(resolved)) {
    ask(
      'This file is what makes a directory a cfourdev workspace, and `cfour init` writes ' +
        'it — along with the smallest model that already draws something. Creating it by ' +
        'hand skips that, and skips the validation. Only go ahead if the CLI genuinely ' +
        'cannot express what is needed here — and say which capability is missing.'
    )
  }

  const root = workspaceRootOf(resolved)
  if (!root) process.exit(0)
  const verdict = classify(resolved, root)
  if (!verdict) process.exit(0)

  if (verdict.transient) {
    ask(
      `This file holds ${verdict.what}, and ${verdict.owner}. Editing it by hand is ` +
        'usually a mistake: the next drag overwrites it.'
    )
  }

  ask(
    `This file is part of the cfourdev workspace in ${path.basename(root)}/ — it holds ` +
      `${verdict.what} — and the CLI owns writing it: ${verdict.owner}. The CLI validates ` +
      'after writing and rolls the change back on a new error, which a hand edit does not. ' +
      'Only edit it directly if the CLI genuinely cannot express this — and if so, say which ' +
      'capability is missing, keep the change minimal, and run `cfour check` afterwards.'
  )
}

main().catch(() => process.exit(0))
