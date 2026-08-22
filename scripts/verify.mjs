// The contracts this repository can check without a running conversation.
//
// Most of the plugin is prose, and prose about files. What a test can establish
// is that the mechanical parts behave — the slicing, the invalidation, the
// guard's verdicts — and that the prose refers to things that exist, does not
// quietly re-embed knowledge the plugin is supposed to discover, and does not
// teach a version of cfourdev that no longer exists.
//
// What it cannot establish is behaviour: whether the plugin actually refuses a
// wrong C4 level, or actually asks instead of guessing, is only measurable by
// talking to it.
//
// No framework and no dependencies: `node --test scripts/verify.mjs`.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

import {
  slice,
  titleOf,
  sectionsOf,
  normaliseEtag,
  buildIndex,
  renderCommand,
  findWorkspace,
  siblingWorkspaces,
  cliCacheState,
  blockFile,
} from './knowledge.mjs'

import { loadCases, grade, readTranscript, GRADERS } from './eval.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cfour-verify-'))
}

/** Every text file of the plugin, so prose checks reach README and workflows too. */
function allFiles(dir = ROOT, found = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) allFiles(p, found)
    else found.push(p)
  }
  return found
}

const skillFiles = () =>
  fs
    .readdirSync(path.join(ROOT, 'skills'), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ name: e.name, file: path.join(ROOT, 'skills', e.name, 'SKILL.md') }))

// ---------------------------------------------------------------------------
// Slicing the documentation
// ---------------------------------------------------------------------------

// The markers are the ones the published file actually carries: `doc:<slug>`,
// where the slug is also the path of the page on the documentation site and may
// therefore have segments.
const DOC_SAMPLE = `<!-- cfourdev-llms: v1 -->
conteudo-sha256: abc123

# Preamble

Index of things.

<!-- doc:inicio -->

# Start here

text

<!-- doc:modelando/anatomia -->

# Anatomy

## Where things live

text

## Three concepts

more text

<!-- doc:referencia/cli -->

# Commands

command surface that must not be stored
`

test('slice: splits on the markers the file carries, and keeps the preamble as `index`', () => {
  const blocks = slice(DOC_SAMPLE)
  assert.deepEqual(Object.keys(blocks).sort(), [
    'index',
    'inicio',
    'modelando/anatomia',
    'referencia/cli',
  ])
  assert.match(blocks.index, /Index of things/)
  assert.match(blocks['modelando/anatomia'], /^# Anatomy/)
  assert.doesNotMatch(
    blocks['modelando/anatomia'],
    /command surface/,
    'a block must stop at the next marker'
  )
})

test('slice: a slug with segments survives, because the documentation is a tree', () => {
  const blocks = slice(DOC_SAMPLE)
  assert.ok(blocks['modelando/anatomia'], 'a nested slug must not be dropped')
  assert.ok(
    !Object.keys(blocks).some((k) => k === 'modelando'),
    'and must not be truncated to its first segment'
  )
})

test('slice: a file with no markers yields no blocks rather than one giant one', () => {
  assert.deepEqual(slice('# just a document\n\nwith no markers'), {})
})

test('slice: a slug that could climb out of the cache is not a slug', () => {
  const hostile = '<!-- doc:../../escape -->\n\n# nope\n'
  assert.deepEqual(slice(hostile), {}, 'the marker must not match at all')
})

test('titleOf and sectionsOf read the headings a block advertises', () => {
  const blocks = slice(DOC_SAMPLE)
  assert.equal(titleOf(blocks['modelando/anatomia']), 'Anatomy')
  assert.deepEqual(sectionsOf(blocks['modelando/anatomia']), [
    'Where things live',
    'Three concepts',
  ])
})

test('blockFile: a segmented slug becomes a path inside the cache, and nothing above it', () => {
  const data = '/cache'
  const nested = blockFile(data, 'modelando/anatomia')
  assert.equal(nested, path.join('/cache', 'knowledge', 'doc', 'modelando', 'anatomia.md'))
  assert.equal(blockFile(data, 'inicio'), path.join('/cache', 'knowledge', 'doc', 'inicio.md'))
  assert.ok(nested.startsWith(path.join('/cache', 'knowledge', 'doc') + path.sep))
})

test('the command reference page is discarded, because the installed CLI outranks it', () => {
  const source = fs.readFileSync(path.join(ROOT, 'scripts', 'knowledge.mjs'), 'utf8')
  const discarded = source.match(/const DISCARDED_BLOCKS = new Set\(\[([^\]]*)\]\)/)
  assert.ok(discarded, 'the discard list must stay declarative')
  assert.match(discarded[1], /referencia\/cli/)
})

// ---------------------------------------------------------------------------
// Invalidation
// ---------------------------------------------------------------------------

test('normaliseEtag: weak and strong validators of the same body compare equal', () => {
  assert.equal(normaliseEtag('W/"abc"'), normaliseEtag('"abc"'))
  assert.equal(normaliseEtag('W/"abc"'), 'abc')
  assert.notEqual(normaliseEtag('"abc"'), normaliseEtag('"def"'))
  assert.equal(normaliseEtag(null), null)
})

test('cliCacheState: knowledge stored for another release counts as no knowledge', () => {
  const on = (installed, stored, onDisk = true) => cliCacheState({ installed, stored, onDisk })
  assert.equal(on('1.0.0', '1.0.0'), 'fresh')
  assert.equal(on('1.1.0', '1.0.0'), 'stale', 'a newer CLI invalidates what was stored')
  assert.equal(on('1.0.0', '1.1.0'), 'stale', 'so does a downgrade')
  assert.equal(on('1.0.0-rc2', '1.0.0-rc1'), 'stale', 'pre-releases are versions too')
  assert.equal(on('1.0.0', null), 'absent')
  assert.equal(on('1.0.0', '1.0.0', false), 'absent', 'metadata without files is not a cache')
  assert.equal(on(null, '1.0.0'), 'unknown', 'with no CLI there is nothing to compare against')
})

// ---------------------------------------------------------------------------
// Rendering the CLI surface
// ---------------------------------------------------------------------------

const TREE_SAMPLE = {
  version: '9.9.9',
  caminho: ['cfour'],
  nome: 'cfour',
  subcomandos: [
    {
      caminho: ['cfour', 'element'],
      nome: 'element',
      descricao: 'the boxes',
      subcomandos: [
        {
          caminho: ['cfour', 'element', 'add'],
          nome: 'add',
          descricao: 'creates a box',
          argumentos: [
            { nome: 'nome', obrigatorio: true, descricao: 'the readable name; the id is generated' },
            { nome: 'extra', obrigatorio: false, descricao: 'something else' },
          ],
          opcoes: [
            { flags: '--name <n>', descricao: 'readable name', obrigatoria: true, repetivel: false },
            { flags: '--tag <t>', descricao: 'a tag', obrigatoria: true, repetivel: true },
          ],
          exemplos: ['cfour element add "Loja Online"'],
        },
      ],
    },
  ],
}

test('buildIndex: one line per runnable command, and never a group', () => {
  const index = buildIndex(TREE_SAMPLE)
  const lines = index.trim().split('\n')
  assert.equal(lines.length, 1, 'only the leaf is runnable')
  assert.match(lines[0], /^cfour element add <nome> \[extra\] {2,}creates a box$/)
})

test('buildIndex: signature and description never collide, however long the signature', () => {
  const long = structuredClone(TREE_SAMPLE)
  long.subcomandos[0].subcomandos[0].argumentos = [
    { nome: 'a-very-long-argument-name-indeed', obrigatorio: true, descricao: '' },
    { nome: 'and-another-one-just-as-long', obrigatorio: true, descricao: '' },
  ]
  for (const line of buildIndex(long).trim().split('\n')) {
    assert.match(line, />\s{2,}\w/, `no gap between signature and description: ${line}`)
  }
})

test('renderCommand: repeatable options are marked, and `obrigatoria` is not leaked as "required"', () => {
  const node = TREE_SAMPLE.subcomandos[0].subcomandos[0]
  const text = renderCommand(node)
  assert.match(text, /--tag <t> \(repeatable\)/)
  assert.match(text, /extra \(optional\)/)
  // In the tree the CLI publishes, `obrigatoria: true` means "takes a value".
  // Rendering it as a requirement would push the model to pass flags nobody
  // asked for, so no option may be described as required.
  assert.doesNotMatch(text, /--name <n>[^\n]*required/i)
  assert.match(text, /examples:\n {2}cfour element add "Loja Online"/)
})

// ---------------------------------------------------------------------------
// Finding the workspace
// ---------------------------------------------------------------------------

test('findWorkspace: walks up to cfour.yaml, and reports its absence rather than guessing', () => {
  const base = tmpdir()
  const deep = path.join(base, 'repo', 'src', 'a', 'b')
  fs.mkdirSync(deep, { recursive: true })
  assert.equal(findWorkspace(deep), null)
  const workspace = path.join(base, 'repo', 'cfour.yaml')
  fs.writeFileSync(workspace, 'version: 3\nid: repo\n')
  assert.equal(findWorkspace(deep), workspace)
  fs.rmSync(base, { recursive: true, force: true })
})

test('findWorkspace: the NEAREST cfour.yaml wins, which is what allows sibling workspaces', () => {
  // A repository holds several workspaces side by side. A file inside one of
  // them belongs to that one, not to whatever is furthest up the tree — the
  // same answer the CLI gives when run from that directory.
  const base = tmpdir()
  const loja = path.join(base, 'loja')
  const dentro = path.join(loja, 'models', 'vendas')
  fs.mkdirSync(dentro, { recursive: true })
  fs.writeFileSync(path.join(base, 'cfour.yaml'), 'version: 3\nid: raiz\n')
  fs.writeFileSync(path.join(loja, 'cfour.yaml'), 'version: 3\nid: loja\n')
  assert.equal(findWorkspace(dentro), path.join(loja, 'cfour.yaml'))
  fs.rmSync(base, { recursive: true, force: true })
})

test('siblingWorkspaces: the other workspaces of the repository, since nothing registers them', () => {
  const base = tmpdir()
  fs.mkdirSync(path.join(base, '.git'), { recursive: true })
  for (const name of ['loja', 'pagamentos', 'src']) fs.mkdirSync(path.join(base, name), { recursive: true })
  fs.mkdirSync(path.join(base, 'node_modules', 'pacote'), { recursive: true })
  for (const name of ['loja', 'pagamentos']) {
    fs.writeFileSync(path.join(base, name, 'cfour.yaml'), `version: 3\nid: ${name}\n`)
  }
  fs.writeFileSync(path.join(base, 'node_modules', 'pacote', 'cfour.yaml'), 'version: 3\nid: nope\n')

  const own = path.join(base, 'loja', 'cfour.yaml')
  const found = siblingWorkspaces(path.join(base, 'loja'), own)
  assert.deepEqual(found, [path.join(base, 'pagamentos', 'cfour.yaml')], 'itself excluded, dependencies excluded')

  assert.deepEqual(
    siblingWorkspaces(base, null).sort(),
    [own, path.join(base, 'pagamentos', 'cfour.yaml')].sort(),
    'with no workspace governing, all of them are reported'
  )

  const orphan = tmpdir()
  assert.deepEqual(siblingWorkspaces(orphan, null), [], 'outside a repository there is nothing to enumerate')
  fs.rmSync(base, { recursive: true, force: true })
  fs.rmSync(orphan, { recursive: true, force: true })
})

test('findWorkspace: nothing but cfour.yaml makes a directory a workspace', () => {
  const base = tmpdir()
  // The shape of the current structure, minus the one structural file. There is
  // no index, no registry and no manifest to fall back on, so this is not a
  // workspace and no amount of models/ and views/ makes it one.
  fs.mkdirSync(path.join(base, 'models', 'vendas'), { recursive: true })
  fs.mkdirSync(path.join(base, 'views'), { recursive: true })
  fs.writeFileSync(path.join(base, 'models', 'vendas', 'elements.yaml'), 'elements: []\n')
  fs.writeFileSync(path.join(base, 'views', 'contexto.yaml'), 'kind: diagram\n')
  assert.equal(findWorkspace(base), null)
  fs.rmSync(base, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// The write guard
// ---------------------------------------------------------------------------

function guard(filePath, toolName = 'Edit') {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', 'guard-model.mjs')], {
    input: JSON.stringify({ tool_name: toolName, tool_input: { file_path: filePath } }),
    encoding: 'utf8',
  })
  return out.trim() ? JSON.parse(out) : null
}

/**
 * A workspace with the shape `cfour init` actually produces, plus the two files
 * `cfour pull` writes: the pinned closure and the downloaded copies of it.
 */
function fakeWorkspace(base = tmpdir()) {
  fs.mkdirSync(path.join(base, 'models', 'vendas'), { recursive: true })
  fs.mkdirSync(path.join(base, 'views'), { recursive: true })
  fs.mkdirSync(path.join(base, 'layouts'), { recursive: true })
  fs.mkdirSync(path.join(base, '.cfour', 'usos'), { recursive: true })
  fs.mkdirSync(path.join(base, 'src'), { recursive: true })
  fs.writeFileSync(path.join(base, 'cfour.yaml'), 'version: 3\nid: loja\nrepo: loja\nstatus: active\n')
  fs.writeFileSync(path.join(base, 'cfour.lock'), 'usos: []\n')
  fs.writeFileSync(path.join(base, '.cfour', 'usos', 'acme-comuns.json'), '{}\n')
  fs.writeFileSync(path.join(base, 'models', 'vendas', 'elements.yaml'), 'elements: []\n')
  fs.writeFileSync(path.join(base, 'views', 'contexto.yaml'), 'kind: diagram\n')
  fs.writeFileSync(path.join(base, 'layouts', 'contexto.json'), '{}\n')
  return base
}

test('guard: escalates every file the CLI owns, and names the command that owns it', () => {
  const base = fakeWorkspace()
  const cases = [
    [path.join(base, 'cfour.yaml'), /cfour workspace set|cfour config/],
    [path.join(base, 'models', 'vendas', 'elements.yaml'), /cfour element/],
    [path.join(base, 'models', 'vendas', 'relations.yaml'), /cfour relation/],
    [path.join(base, 'views', 'contexto.yaml'), /cfour diagram/],
    [path.join(base, 'views', 'checkout.yaml'), /cfour flow/],
    [path.join(base, 'layouts', 'contexto.json'), /viewer/],
    [path.join(base, 'cfour.lock'), /cfour pull/],
    [path.join(base, '.cfour', 'usos', 'acme-comuns.json'), /cfour pull/],
  ]
  for (const [file, expected] of cases) {
    const verdict = guard(file)
    assert.ok(verdict, `expected a verdict for ${file}`)
    assert.equal(verdict.hookSpecificOutput.permissionDecision, 'ask', file)
    assert.match(verdict.hookSpecificOutput.permissionDecisionReason, expected, file)
  }
  fs.rmSync(base, { recursive: true, force: true })
})

test('guard: creating the workspace file by hand is escalated too, and points at `cfour init`', () => {
  const base = tmpdir()
  const verdict = guard(path.join(base, 'cfour.yaml'))
  assert.ok(verdict, 'a cfour.yaml that does not exist yet still belongs to the CLI')
  assert.match(verdict.hookSpecificOutput.permissionDecisionReason, /cfour init/)
  fs.rmSync(base, { recursive: true, force: true })
})

test('guard: escalates rather than blocks, because the hand edit has a legitimate exception', () => {
  const base = fakeWorkspace()
  const verdict = guard(path.join(base, 'models', 'vendas', 'elements.yaml'))
  assert.notEqual(verdict.hookSpecificOutput.permissionDecision, 'deny')
  assert.match(verdict.hookSpecificOutput.permissionDecisionReason, /which capability is missing/)
  fs.rmSync(base, { recursive: true, force: true })
})

test('guard: stays out of the way of everything else', () => {
  const base = fakeWorkspace()
  const untouched = [
    [path.join(base, 'README.md'), 'prose beside a workspace is not the workspace'],
    [path.join(base, 'src', 'index.ts'), 'the software being documented'],
    [path.join(base, 'package.json'), 'the repository is not the model'],
    [path.join(base, 'models', 'vendas', 'NOTES.md'), 'only YAML in a model is model data'],
    [path.join(base, 'views', 'draft', 'sketch.yaml'), 'views/ is flat; a subfolder is not a view'],
    ['/tmp/somewhere-else/models/x/elements.yaml', 'no cfour.yaml above it: not a workspace'],
  ]
  for (const [file, why] of untouched) assert.equal(guard(file), null, why)
  fs.rmSync(base, { recursive: true, force: true })
})

test('guard: the structure that no longer exists is no longer protected', () => {
  // Guarding paths from before the simplification would stop people editing
  // ordinary files of their own repository that merely share a name.
  const base = fakeWorkspace()
  const gone = [
    path.join(base, 'modelagem.yaml'),
    path.join(base, 'model', 'loja', 'elements.yaml'),
    path.join(base, 'model', 'workspace.yaml'),
    path.join(base, '.layout', 'contexto.json'),
  ]
  for (const file of gone) assert.equal(guard(file), null, `${rel(file)} is not cfourdev's any more`)

  // And the names that used to mean something inside a model now mean nothing
  // in particular: the arrangement of files within a model is free, so this is
  // guarded as ordinary model data and not as a manifest of its own.
  const verdict = guard(path.join(base, 'models', 'vendas', 'project.yaml'))
  assert.match(verdict.hookSpecificOutput.permissionDecisionReason, /the model `vendas`/)
  fs.rmSync(base, { recursive: true, force: true })
})

test('guard: with sibling workspaces, a file belongs to the nearest one', () => {
  // Naming the wrong workspace in the escalation would send someone to run the
  // command from the wrong directory, where it would create a second copy of
  // the box rather than change the one they meant.
  const repo = tmpdir()
  fakeWorkspace(path.join(repo, 'loja'))
  fakeWorkspace(path.join(repo, 'pagamentos'))
  const verdict = guard(path.join(repo, 'pagamentos', 'models', 'vendas', 'elements.yaml'))
  assert.match(verdict.hookSpecificOutput.permissionDecisionReason, /pagamentos\//)
  assert.doesNotMatch(verdict.hookSpecificOutput.permissionDecisionReason, /loja\//)
  fs.rmSync(repo, { recursive: true, force: true })
})

test('guard: a malformed payload never stands between someone and their files', () => {
  const out = execFileSync('node', [path.join(ROOT, 'scripts', 'guard-model.mjs')], {
    input: 'not json at all',
    encoding: 'utf8',
  })
  assert.equal(out.trim(), '')
})

// ---------------------------------------------------------------------------
// The plugin's own shape
// ---------------------------------------------------------------------------

test('manifests parse, and declare what the loader looks for', () => {
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'))
  assert.equal(plugin.name, 'cfour')
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/)
  assert.ok(plugin.description.length > 40, 'the description is what makes the plugin findable')

  const market = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'))
  assert.deepEqual(market.plugins.map((p) => p.name), ['cfour'])

  const mcp = JSON.parse(fs.readFileSync(path.join(ROOT, '.mcp.json'), 'utf8'))
  const server = mcp.mcpServers.cfourdev
  assert.equal(server.type, 'http', 'a url entry with no type is read as a stdio server')
  assert.ok(server.oauth.clientId, 'the server has no dynamic client registration')
  assert.equal(
    typeof server.oauth.callbackPort,
    'number',
    'the registered redirect URIs are bound to one port; without it sign-in fails'
  )
  assert.match(server.oauth.scopes, /mcp\.read/)
})

test('every hook and every skill points at a file that exists', () => {
  const missing = []
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks', 'hooks.json'), 'utf8'))
  for (const group of Object.values(hooks.hooks).flat()) {
    for (const h of group.hooks) {
      for (const m of h.command.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s"']+)/g)) {
        if (!fs.existsSync(path.join(ROOT, m[1]))) missing.push(`hooks.json -> ${m[1]}`)
      }
    }
  }
  for (const { file } of skillFiles()) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^\s"']+)/g)) {
      if (!fs.existsSync(path.join(ROOT, m[1]))) missing.push(`${rel(file)} -> ${m[1]}`)
    }
    for (const m of text.matchAll(/`?references\/([a-z0-9-]+\.md)`?/g)) {
      const target = path.join(path.dirname(file), 'references', m[1])
      if (!fs.existsSync(target)) missing.push(`${rel(file)} -> references/${m[1]}`)
    }
  }
  assert.deepEqual(missing, [], 'these references point at nothing')
})

test('every skill declares a name matching its directory, and a description that routes to it', () => {
  const problems = []
  for (const { name, file } of skillFiles()) {
    if (!fs.existsSync(file)) {
      problems.push(`skills/${name}/SKILL.md is missing`)
      continue
    }
    const text = fs.readFileSync(file, 'utf8')
    const front = text.match(/^---\n([\s\S]*?)\n---\n/)
    if (!front) {
      problems.push(`skills/${name}: no frontmatter`)
      continue
    }
    const declared = front[1].match(/^name:\s*(\S+)/m)?.[1]
    const description = front[1].match(/^description:\s*(.+)$/m)?.[1]
    if (declared !== name) problems.push(`skills/${name}: declares name "${declared}"`)
    if (!description || description.length < 60) {
      problems.push(`skills/${name}: description too thin to route on`)
    }
    if (description && !/\buse\b/i.test(description)) {
      problems.push(`skills/${name}: description does not say when to use it`)
    }
  }
  assert.deepEqual(problems, [])
})

test('the agent exists and is barred from writing', () => {
  const file = path.join(ROOT, 'agents', 'investigator.md')
  const text = fs.readFileSync(file, 'utf8')
  const tools = text.match(/^tools:\s*(.+)$/m)?.[1] || ''
  for (const forbidden of ['Write', 'Edit', 'NotebookEdit']) {
    assert.ok(!tools.includes(forbidden), `the investigator must not be able to ${forbidden}`)
  }
})

// ---------------------------------------------------------------------------
// Knowledge stays discovered, not embedded
// ---------------------------------------------------------------------------

test('no documentation address is hardcoded outside the discovery that resolves it', () => {
  // The plugin asks the CLI and the MCP server where the documentation lives,
  // so that a move of the docs portal costs no release. A literal llms.txt
  // address anywhere else is that discovery being quietly bypassed.
  const offenders = []
  for (const file of allFiles()) {
    if (rel(file) === 'scripts/verify.mjs') continue
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/https?:\/\/\S*llms(?:-full)?\.txt/g)) {
      offenders.push(`${rel(file)}: ${m[0]}`)
    }
  }
  assert.deepEqual(offenders, [], 'these should be discovered at runtime instead')
})

test('the CLI surface is not restated in prose', () => {
  // Flags belong to the installed CLI, which the knowledge cache serves one
  // command at a time. A skill listing them goes stale silently on the next
  // release, and the model has no way to tell which copy is true.
  //
  // The few allowed here are the ones a skill has to name to teach a rule that
  // is not about the flag: `--parent` because it is what decides the C4 level,
  // `--dry-run` and `--json` because when to reach for them is a judgement, and
  // the knowledge cache's own options.
  const allowed = new Set([
    '--json', '--dry-run', '--inventory', '--resolved', '--parent', '--level',
    '--meta', '--tag', '--kind', '--force', '--key', '--id', '--nome',
    '--data', '--cwd',
  ])
  const offenders = []
  for (const { name, file } of skillFiles()) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/--[a-z][a-z-]+/g)) {
      if (!allowed.has(m[0])) offenders.push(`skills/${name}: ${m[0]}`)
    }
  }
  assert.deepEqual(offenders, [], 'ask the knowledge cache for these instead of writing them down')
})

test('documentation pages are pulled by name, never transcribed', () => {
  // A skill may say which page answers a subject; it may not paste the page.
  // The tell is a fenced YAML sample of the model format, which is exactly the
  // knowledge that belongs to the documentation and changes with it.
  const offenders = []
  for (const { name, file } of skillFiles()) {
    const text = fs.readFileSync(file, 'utf8')
    for (const m of text.matchAll(/```ya?ml\n([\s\S]*?)```/g)) {
      offenders.push(`skills/${name}: ${m[1].split('\n')[0]}`)
    }
  }
  assert.deepEqual(offenders, [], 'pull the documentation page instead of copying the format into a skill')
})

test('the write rule is stated where it binds, and nowhere contradicted', () => {
  const operate = fs.readFileSync(path.join(ROOT, 'skills', 'operate', 'SKILL.md'), 'utf8')
  assert.match(operate, /never (change|write) .*(model|YAML)|never .*parsing YAML/i)
  assert.match(operate, /When the CLI cannot do it/, 'the exception needs a stated procedure')
})

// ---------------------------------------------------------------------------
// Nothing from a previous version of the structure survives
// ---------------------------------------------------------------------------

// cfourdev's structure moved twice, and both moves left residue that reads as
// perfectly sensible prose. What is checked here is the OPERATIONAL residue:
// commands that no longer exist, files that are no longer written, cardinality
// that is no longer true, and a reference grammar that was deleted along with
// derived identifiers. Bare words are deliberately not matched: "model" and
// "project" are ordinary English, and a test that banned them would be a test
// nobody could satisfy honestly.
const OBSOLETE = [
  { pattern: /\bcfour\s+modelagem\b/, why: 'the `cfour modelagem` family no longer exists' },
  { pattern: /\bcfour\s+projects?\b/, why: 'the `cfour project` family no longer exists' },
  { pattern: /\bcfour\s+federacao\b/, why: 'the `cfour federacao` family no longer exists' },
  { pattern: /\bmodelagem\.yaml\b/, why: 'a modelling is no longer a directory with its own manifest' },
  { pattern: /\bregistry-missing\b/, why: 'there is no registry to be missing; the state is workspace-missing' },
  { pattern: /\bfindRegistry\b/, why: 'the workspace is found by walking up to cfour.yaml' },
  { pattern: /\.layout\//, why: 'the arrangement is written to layouts/' },
  { pattern: /\bmodel\/[a-z0-9-]+\/[a-z]/, why: 'models live under models/, plural' },
  { pattern: /\bproject\.yaml\b/, why: 'a model has no manifest: the folder name is the id' },
  {
    pattern: /model registry|the registry\b|a registry of|registered models?\b/i,
    why: 'there is no registry: the workspace is the directory holding cfour.yaml',
  },
  {
    pattern: /active mode(l|lling)\b|which mode(l|lling) is active/i,
    why: 'nothing is selected or activated; the workspace found by walking up is the one',
  },

  // --- what changed when a repository stopped meaning a workspace ---------
  {
    pattern: /\bone (workspace )?per repository\b|a workspace per repository|one workspace to a repository/i,
    why: 'a repository holds several workspaces side by side, one per system',
  },
  {
    pattern: /the workspace at (the|its) root|cfour\.yaml at its root\b/i,
    why: 'a workspace root is wherever its cfour.yaml is, and it is rarely the repository root',
  },

  // --- what changed when identifiers stopped being derived ----------------
  {
    pattern: /falls? back to `?shared`?|resolves? .*then in `?shared`?/i,
    why: 'a reference has no fallback, and no resolution order: it is a lookup',
  },
  {
    pattern: /counting slashes|three-segment form|qualif(y|ying) the id|qualified id\b/i,
    why: 'an id is opaque and global; there is no grammar to qualify and no slashes to count',
  },
  {
    pattern: /a (model|namespace) that owns identifiers|models? are namespaces?|namespace that owns/i,
    why: 'a model groups elements; an identifier does not pass through it',
  },
  {
    pattern: /\b(a|the) mirror\b|mirror element|as a mirror\b|mirrors the (box|element)/i,
    why: 'the mirror element was removed: two boxes become one by sharing an id',
  },
  {
    pattern: /an id is derived|ids? (are|is) derived from|derived from the (box|element)['’]?s? name/i,
    why: "an element's id is generated at creation and derives from nothing",
  },
]

/**
 * Where the legacy scan does not reach, and why.
 *
 * `evals/` is the one place in this repository that is SUPPOSED to contain the
 * old vocabulary: a regression case exists precisely to put the removed word in
 * front of the agent and check that it translates the intent instead of
 * rebuilding the structure. `case.json` carries the reason in its `why`.
 */
const NOT_SCANNED = [/^scripts\/verify\.mjs$/, /^evals\//]

test('no concept from a previous structure survives anywhere in the plugin', () => {
  const offenders = []
  for (const file of allFiles()) {
    if (NOT_SCANNED.some((p) => p.test(rel(file)))) continue
    const text = fs.readFileSync(file, 'utf8')
    for (const { pattern, why } of OBSOLETE) {
      const hit = text.match(pattern)
      if (hit) offenders.push(`${rel(file)}: "${hit[0].trim()}" — ${why}`)
    }
  }
  assert.deepEqual(offenders, [], 'residue of a structure cfourdev no longer has')
})

test('the pre-approved commands are read-only, and all still exist', () => {
  const settings = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings.json'), 'utf8'))
  const allow = settings.permissions.allow
  const writes = /\b(add|set|rm|mv|init|push|login|logout|use|serve|step)\b/
  const removed = /\b(modelagem|project|federacao)\b/
  for (const entry of allow) {
    assert.match(entry, /^Bash\(cfour /, `${entry} is not a cfour command`)
    assert.doesNotMatch(entry, writes, `${entry} can change something and must not be pre-approved`)
    assert.doesNotMatch(entry, removed, `${entry} names a command family that no longer exists`)
  }
})

test('the three current concepts are taught, with the cardinality that constrains them', () => {
  // The routing skill is where someone lands first, so it is where the
  // distinction has to be legible: these are cfourdev's concepts, and only one
  // of the three carries architectural weight.
  const modeling = fs.readFileSync(path.join(ROOT, 'skills', 'modeling', 'SKILL.md'), 'utf8')
  for (const concept of ['workspace', 'model', 'view']) {
    assert.match(modeling, new RegExp(`\\*\\*${concept}\\*\\*`), `${concept} is not introduced`)
  }
  assert.match(modeling, /cfour\.yaml/, 'the one structural file has to be named')
  assert.match(
    modeling,
    /several,? side by side|side by side|a repository holds several/i,
    'a repository holding several workspaces is the fact everything else depends on'
  )
  assert.match(
    modeling,
    /one context|context diagram/i,
    'and the one-context rule is what makes a workspace a boundary rather than a folder'
  )
  assert.match(
    modeling,
    /generated|opaque/i,
    'identifiers being generated is what makes renaming and refiling free'
  )

  // Storage moves must stay distinguishable from architectural ones, and the
  // line moved: filing a box in another model is free, and putting it in
  // another workspace is a claim that it is a different system.
  const c4 = fs.readFileSync(path.join(ROOT, 'skills', 'architecture', 'references', 'c4.md'), 'utf8')
  assert.match(c4, /filing decision/i, 'the boundary must be stated explicitly')
  assert.match(
    c4,
    /one\s+workspace is one\s+system/i,
    'and so must the part of it that is architectural'
  )
})

// ---------------------------------------------------------------------------
// The behavioural suite, checked mechanically
// ---------------------------------------------------------------------------
//
// `evals/` is where the plugin's actual claims are tested, and running it costs
// money and minutes, so it is not part of this file. What IS checked here is
// that the suite is well-formed — a case with a typo in a grader name, or a
// regular expression that does not compile, fails silently in a way nobody
// notices until the day it was supposed to catch something.

test('every eval case is well-formed, and says why it exists', () => {
  const problems = []
  for (const spec of loadCases()) {
    if (!spec.why || spec.why.length < 40) {
      problems.push(`${spec.name}: no "why", or too thin to justify the case`)
    }
    if (!spec.prompt) problems.push(`${spec.name}: empty prompt`)
    if (!(spec.tags || []).length) problems.push(`${spec.name}: no tags`)
    if (!(spec.expect || []).length) problems.push(`${spec.name}: nothing is graded`)
    for (const check of spec.expect || []) {
      const kinds = Object.keys(check).filter((k) => k !== 'why')
      if (kinds.length !== 1) {
        problems.push(`${spec.name}: a grader carries ${kinds.length} kinds: ${kinds.join(', ')}`)
        continue
      }
      const [kind] = kinds
      if (!(kind in GRADERS)) {
        problems.push(`${spec.name}: unknown grader "${kind}"`)
        continue
      }
      if (!check.why) problems.push(`${spec.name}: grader "${kind}" does not say what it defends`)
      if (kind !== 'shell') {
        try {
          new RegExp(check[kind])
        } catch (e) {
          problems.push(`${spec.name}: ${kind} is not a regular expression — ${e.message}`)
        }
      }
    }
  }
  assert.deepEqual(problems, [])
})

test('the suite still covers every area a cfourdev change could break', () => {
  // Not a completeness claim — nothing could make one. It is a floor: if an
  // area loses its last case, that is a deletion someone has to justify rather
  // than a suite that quietly got smaller.
  const covered = new Set(loadCases().flatMap((c) => c.tags || []))
  const required = ['estrutura', 'identidade', 'federacao', 'descoberta', 'guard', 'evidencia']
  assert.deepEqual(
    required.filter((t) => !covered.has(t)),
    [],
    'these areas have no behavioural regression case at all'
  )
})

test('readTranscript: pulls the answer, the commands and the edits out of the stream', () => {
  const stream = [
    JSON.stringify({ type: 'system', subtype: 'init' }),
    'not json at all',
    JSON.stringify({
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'thinking' },
          { type: 'tool_use', name: 'Bash', input: { command: 'cfour element add "API"' } },
          { type: 'tool_use', name: 'Edit', input: { file_path: '/w/models/vendas/elements.yaml' } },
        ],
      },
    }),
    JSON.stringify({ type: 'result', result: 'done', total_cost_usd: 0.5 }),
  ].join('\n')
  const run = readTranscript(stream)
  assert.deepEqual(run.commands, ['cfour element add "API"'])
  assert.deepEqual(run.edits, ['/w/models/vendas/elements.yaml'])
  assert.equal(run.answer, 'done')
  assert.equal(run.cost, 0.5)
})

test('grade: each grader kind decides on its own evidence', () => {
  const run = {
    answer: 'duas workspaces, lado a lado',
    commands: ['cfour uses add ../loja'],
    edits: ['/w/cfour.yaml'],
    sandbox: ROOT,
  }
  const verdicts = grade(
    {
      name: 'sample',
      expect: [
        { answer_matches: 'duas workspaces' },
        { answer_lacks: 'uma workspace por repositorio' },
        { ran: 'cfour uses add' },
        { did_not_run: 'cfour init' },
        { no_edit_of: 'models/' },
        { answer_matches: 'nao esta escrito aqui' },
        { no_edit_of: 'cfour\\.yaml' },
      ],
    },
    run
  )
  assert.deepEqual(
    verdicts.map((v) => v.pass),
    [true, true, true, true, true, false, false]
  )
})
