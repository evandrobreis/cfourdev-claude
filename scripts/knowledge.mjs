#!/usr/bin/env node
// The plugin's knowledge cache.
//
// It exists for an architectural reason: both sources of truth about cfourdev
// are too large for a model's context. The command tree the CLI publishes is
// over 100 KB; the official documentation is over 250 KB across dozens of
// pages. Neither fits in a prompt, and neither should be memorised inside the
// plugin — a new CLI release changes the first, and the second changes on its
// own.
//
// So this script fetches, slices and stores, then serves a few KB at a time:
// the help for ONE command, or ONE page of documentation.
//
// Nothing here decides anything about modelling. It answers three questions:
//   - what can the installed CLI do          (`cli`)
//   - what does the documentation say about X (`doc`, `search`)
//   - is the environment ready               (`status`)
//
// No dependencies: Node >= 18, global `fetch`.

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Cache layout version. Bumping it invalidates everything already on disk. */
const CACHE_VERSION = 2

/**
 * The documentation's command reference is DISCARDED on purpose.
 *
 * It restates the command surface flag by flag, and the published documentation
 * may describe a different release than the one actually installed. Two
 * descriptions of the same thing, drifting apart silently, are worse than one.
 * The installed CLI always wins — and it is the CLI that answers `cli`.
 *
 * The narrative pages about the command line are kept: they explain how to
 * decide which command to reach for, which is knowledge no `--help` carries.
 */
const DISCARDED_BLOCKS = new Set(['referencia/cli'])

// ---------------------------------------------------------------------------
// Where the cache lives
// ---------------------------------------------------------------------------

/**
 * The data directory, in order of precedence:
 *   1. --data, when the caller knows where it wants it
 *   2. CLAUDE_PLUGIN_DATA, which survives plugin updates
 *   3. the user cache, for anyone running the script standalone
 */
function dataDir(argv) {
  const explicit = valueOf(argv, '--data')
  if (explicit) return path.resolve(explicit)
  if (process.env.CLAUDE_PLUGIN_DATA) return path.resolve(process.env.CLAUDE_PLUGIN_DATA)
  const base = process.env.XDG_CACHE_HOME || path.join(os.homedir(), '.cache')
  return path.join(base, 'cfourdev-claude')
}

const paths = (data) => ({
  root: path.join(data, 'knowledge'),
  meta: path.join(data, 'knowledge', 'meta.json'),
  cli: path.join(data, 'knowledge', 'cli'),
  tree: path.join(data, 'knowledge', 'cli', 'tree.json'),
  index: path.join(data, 'knowledge', 'cli', 'index.txt'),
  doc: path.join(data, 'knowledge', 'doc'),
})

function readMeta(data) {
  const p = paths(data)
  try {
    const m = JSON.parse(fs.readFileSync(p.meta, 'utf8'))
    return m.version === CACHE_VERSION ? m : empty()
  } catch {
    return empty()
  }
  function empty() {
    return { version: CACHE_VERSION, cli: null, doc: null }
  }
}

function writeMeta(data, meta) {
  const p = paths(data)
  fs.mkdirSync(p.root, { recursive: true })
  fs.writeFileSync(p.meta, JSON.stringify(meta, null, 2) + '\n')
}

// ---------------------------------------------------------------------------
// The CLI: the source of truth about its own surface
// ---------------------------------------------------------------------------

function runCfour(args) {
  try {
    return execFileSync('cfour', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch {
    return null
  }
}

function cliVersion() {
  const out = runCfour(['--version'])
  if (!out) return null
  const m = out.trim().match(/\d+\.\d+\.\d+[^\s]*/)
  return m ? m[0] : out.trim() || null
}

/**
 * Walks the command tree. `path` is the list the CLI itself publishes —
 * ['cfour', 'element', 'add'] — so matching is exact rather than heuristic.
 */
function findCommand(node, target) {
  if (!node) return null
  const p = node.caminho || []
  if (p.length === target.length && p.every((seg, i) => seg === target[i])) return node
  for (const sub of node.subcomandos || []) {
    const hit = findCommand(sub, target)
    if (hit) return hit
  }
  return null
}

function* walk(node) {
  yield node
  for (const sub of node.subcomandos || []) yield* walk(sub)
}

/** The index: one line per runnable command, small enough to read whole. */
export function buildIndex(tree) {
  const lines = []
  for (const node of walk(tree)) {
    if ((node.subcomandos || []).length) continue
    const args = (node.argumentos || [])
      .map((a) => (a.obrigatorio ? `<${a.nome}>` : `[${a.nome}]`))
      .join(' ')
    const signature = [...(node.caminho || [])].join(' ') + (args ? ' ' + args : '')
    lines.push(`${signature.padEnd(38)}  ${node.descricao || ''}`.trimEnd())
  }
  return lines.join('\n') + '\n'
}

/**
 * The help for ONE command, as compact text.
 *
 * The options' `obrigatoria` field is NOT rendered: in the tree the CLI
 * publishes it means "this option takes a value", not "this option is
 * required" — `--name` comes through as `obrigatoria: true` and is optional.
 * Passing that on would push the model to build commands with flags nobody
 * asked for.
 */
export function renderCommand(node) {
  const out = []
  out.push([...(node.caminho || [])].join(' '))
  if (node.aliases?.length) out.push(`aliases: ${node.aliases.join(', ')}`)
  if (node.descricao) out.push(node.descricao)
  if (node.argumentos?.length) {
    out.push('', 'arguments:')
    for (const a of node.argumentos) {
      const mark = a.obrigatorio ? '' : ' (optional)'
      out.push(`  ${a.nome}${mark} — ${a.descricao || ''}`.trimEnd())
    }
  }
  if (node.opcoes?.length) {
    out.push('', 'options:')
    for (const o of node.opcoes) {
      const rep = o.repetivel ? ' (repeatable)' : ''
      out.push(`  ${o.flags}${rep} — ${o.descricao || ''}`.trimEnd())
    }
  }
  if (node.subcomandos?.length) {
    out.push('', 'subcommands:')
    for (const s of node.subcomandos) out.push(`  ${s.nome} — ${s.descricao || ''}`.trimEnd())
  }
  if (node.exemplos?.length) {
    out.push('', 'examples:')
    for (const e of node.exemplos) out.push(`  ${e}`)
  }
  return out.join('\n') + '\n'
}

function syncCli(data, meta) {
  const version = cliVersion()
  if (!version) return { ok: false, reason: 'cli-missing' }
  const raw = runCfour(['help', '--output', 'json'])
  if (!raw) return { ok: false, reason: 'help-json-unavailable' }
  let tree
  try {
    tree = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'help-json-invalid' }
  }
  const p = paths(data)
  fs.mkdirSync(p.cli, { recursive: true })
  fs.writeFileSync(p.tree, JSON.stringify(tree))
  fs.writeFileSync(p.index, buildIndex(tree))
  meta.cli = { version, syncedAt: new Date().toISOString() }
  return { ok: true, version, commands: [...walk(tree)].length }
}

// ---------------------------------------------------------------------------
// The documentation: discovered, not memorised
// ---------------------------------------------------------------------------

/**
 * The documentation address is NOT a constant of this plugin.
 *
 * It is asked for, in this order:
 *   1. of the CLI itself, which prints the address in `cfour help formato`;
 *   2. of the MCP server declared in `.mcp.json`, whose RFC 9728 metadata
 *      carries `resource_documentation`.
 *
 * So when the documentation portal moves, the plugin follows without a release
 * — as long as the tool and the server keep saying where it is, which is the
 * only thing the plugin has any right to demand of them.
 */
async function discoverDocOrigin() {
  const fromFormat = runCfour(['help', 'formato'])
  if (fromFormat) {
    const m = fromFormat.match(/https?:\/\/\S+?llms(?:-full)?\.txt/)
    if (m) return { url: m[0], how: 'cfour help formato' }
  }
  try {
    const mcp = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, '.mcp.json'), 'utf8'))
    const server = Object.values(mcp.mcpServers || {})[0]
    if (server?.url) {
      const base = new URL(server.url).origin
      const r = await fetch(`${base}/.well-known/oauth-protected-resource`)
      if (r.ok) {
        const meta = await r.json()
        if (meta.resource_documentation) {
          return { url: meta.resource_documentation, how: 'MCP server metadata' }
        }
      }
    }
  } catch {
    /* offline, or no metadata: the caller handles the absence */
  }
  return null
}

/** The index (`llms.txt`) points at the full content; follow the pointer. */
async function resolveFullContent(url) {
  if (url.endsWith('llms-full.txt')) return url
  const r = await fetch(url)
  if (!r.ok) throw new Error(`could not read ${url}: HTTP ${r.status}`)
  const text = await r.text()
  const m = text.match(/https?:\/\/\S+?llms-full\.txt/)
  if (!m) throw new Error(`${url} does not point at an llms-full.txt`)
  return m[0]
}

/**
 * Slices the file on the markers it carries itself: `<!-- doc:<slug> -->`,
 * where the slug is also the path of the page on the documentation site, and
 * may therefore have segments — `modelando/anatomia`, `referencia/yaml`.
 *
 * Whatever precedes the first marker is the preamble, which holds the index of
 * every page: it is kept as block `index`.
 *
 * The slug shape is constrained here rather than trusted, because it becomes a
 * path under the cache directory: lowercase, digits, hyphen, and `/` between
 * segments. Nothing that could climb out of the cache can match.
 */
const SLUG = String.raw`[a-z0-9]+(?:-[a-z0-9]+)*`
const MARKER = new RegExp(String.raw`<!--\s*doc:(${SLUG}(?:/${SLUG})*)\s*-->`, 'g')

export function slice(text) {
  const markers = [...text.matchAll(MARKER)]
  const blocks = {}
  if (!markers.length) return blocks
  const preamble = text.slice(0, markers[0].index).trim()
  if (preamble) blocks.index = preamble + '\n'
  for (let i = 0; i < markers.length; i++) {
    const name = markers[i][1]
    const start = markers[i].index + markers[i][0].length
    const end = i + 1 < markers.length ? markers[i + 1].index : text.length
    blocks[name] = text.slice(start, end).trim() + '\n'
  }
  return blocks
}

/** A block's title is its first `#`; enough to list blocks without opening them. */
export function titleOf(block) {
  const m = block.match(/^#\s+(.+)$/m)
  return m ? m[1].trim() : ''
}

/** A block's `##` sections, so `search` can point inside it. */
export function sectionsOf(block) {
  return [...block.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim())
}

/** Strips weak-validator prefix and quotes, so `W/"abc"` and `"abc"` compare equal. */
export function normaliseEtag(etag) {
  if (!etag) return null
  return etag.replace(/^W\//, '').replace(/^"|"$/g, '')
}

/** The content stamp from the preamble, read with a 512-byte ranged request. */
async function remoteStamp(url) {
  try {
    const r = await fetch(url, { headers: { Range: 'bytes=0-511' } })
    if (!r.ok) return null
    const head = await r.text()
    return (head.match(/^conteudo-sha256:\s*(\S+)/m) || [])[1] || null
  } catch {
    return null
  }
}

async function syncDoc(data, meta, { force = false } = {}) {
  const origin = await discoverDocOrigin()
  if (!origin) return { ok: false, reason: 'origin-unknown' }

  let url
  try {
    url = await resolveFullContent(origin.url)
  } catch (e) {
    return { ok: false, reason: 'index-unreadable', detail: e.message }
  }

  // Cheap invalidation, in two steps, before spending 164 KB of download.
  //
  // First the ETag, normalised: the CDN in front of the documentation serves
  // the same file sometimes as a strong ETag and sometimes as a weak one
  // (`W/"..."`), so comparing the raw header re-downloads for no reason.
  //
  // If the ETag does not settle it, one 512-byte ranged read is enough: the
  // file carries a `conteudo-sha256:` of its own content in the preamble. That
  // stamp describes the content rather than the transport, which makes it the
  // more trustworthy of the two.
  const cached = blocksOnDisk(data).length > 0
  let etag = null
  try {
    const r = await fetch(url, { method: 'HEAD' })
    if (r.ok) etag = r.headers.get('etag')
  } catch {
    /* HEAD may not be served; the checks below cover it */
  }
  if (!force && cached && etag && normaliseEtag(meta.doc?.etag) === normaliseEtag(etag)) {
    return { ok: true, unchanged: true, url, etag, decidedBy: 'etag' }
  }
  if (!force && cached && meta.doc?.sha) {
    const stamp = await remoteStamp(url)
    if (stamp && stamp === meta.doc.sha) {
      meta.doc.etag = etag || meta.doc.etag
      meta.doc.checkedAt = new Date().toISOString()
      return { ok: true, unchanged: true, url, sha: stamp, decidedBy: 'content-sha256' }
    }
  }

  const r = await fetch(url)
  if (!r.ok) return { ok: false, reason: 'download-failed', detail: `HTTP ${r.status}` }
  const text = await r.text()

  // The file stamps itself. Without the stamp it is not what we expect, and
  // storing an error page as documentation would be worse than having none.
  if (!/^<!--\s*cfourdev-llms:/.test(text)) {
    return { ok: false, reason: 'unexpected-content', detail: text.slice(0, 80) }
  }
  const sha = (text.match(/^conteudo-sha256:\s*(\S+)/m) || [])[1] || null

  const blocks = slice(text)
  const p = paths(data)
  fs.rmSync(p.doc, { recursive: true, force: true })
  fs.mkdirSync(p.doc, { recursive: true })
  const stored = {}
  for (const [name, content] of Object.entries(blocks)) {
    if (DISCARDED_BLOCKS.has(name)) continue
    const file = blockFile(data, name)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
    stored[name] = { title: titleOf(content), sections: sectionsOf(content), bytes: content.length }
  }
  meta.doc = {
    url,
    discoveredVia: origin.how,
    etag: etag || r.headers.get('etag') || null,
    sha,
    syncedAt: new Date().toISOString(),
    blocks: stored,
  }
  return { ok: true, url, blocks: Object.keys(stored) }
}

/**
 * A block's file. The slug's `/` becomes a directory separator, so the cache
 * mirrors the documentation's own tree and `doc modelando/anatomia` reads the
 * page of that name.
 */
function blockFile(data, name) {
  const segments = name.split('/')
  return path.join(paths(data).doc, ...segments.slice(0, -1), `${segments.at(-1)}.md`)
}

function blocksOnDisk(data) {
  const root = paths(data).doc
  const found = []
  const descend = (dir, prefix) => {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of entries) {
      if (e.isDirectory()) descend(path.join(dir, e.name), `${prefix}${e.name}/`)
      else if (e.name.endsWith('.md')) found.push(prefix + e.name.replace(/\.md$/, ''))
    }
  }
  descend(root, '')
  return found.sort()
}

// ---------------------------------------------------------------------------
// The repository: which workspace governs here
// ---------------------------------------------------------------------------

/**
 * Walks up until it finds `cfour.yaml`, exactly as the CLI does.
 *
 * That file is the workspace, and it is the only path cfourdev resolves by
 * walking up from the working directory. The NEAREST one wins, which is what
 * lets a repository hold several side by side.
 *
 * It does not interpret the file: that is what the CLI is for, since it reads
 * and validates. All that matters here is whether a workspace governs this
 * directory, and where its root is.
 */
export function findWorkspace(from) {
  let dir = path.resolve(from)
  for (;;) {
    const target = path.join(dir, 'cfour.yaml')
    if (fs.existsSync(target)) return target
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/**
 * The other workspaces of this repository.
 *
 * A repository holds several workspaces side by side, one per system, and
 * neither the CLI nor this script can be asked "which ones" — no command
 * enumerates them, because nothing registers them. So the plugin looks, and the
 * looking is deliberately shallow: the immediate children of the repository
 * root, which is how `cfour init` lays them out. A deep scan of somebody's
 * source tree to find a YAML file is not worth what it costs.
 *
 * Knowing they exist is what stops two mistakes: creating a second workspace
 * for a system that already has one, and reporting "there is no model here"
 * when the model is in the folder next door.
 */
export function siblingWorkspaces(from, own) {
  const root = repositoryRoot(from)
  if (!root) return []
  const found = []
  let entries
  try {
    entries = fs.readdirSync(root, { withFileTypes: true })
  } catch {
    return []
  }
  for (const dir of [root, ...entries.filter((e) => e.isDirectory()).map((e) => path.join(root, e.name))]) {
    if (path.basename(dir).startsWith('.') || path.basename(dir) === 'node_modules') continue
    const candidate = path.join(dir, 'cfour.yaml')
    if (fs.existsSync(candidate) && candidate !== own) found.push(candidate)
  }
  return found.sort()
}

/** The repository: the nearest directory holding a `.git`, or nothing. */
function repositoryRoot(from) {
  let dir = path.resolve(from)
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/**
 * Whether what is stored still describes the CLI that is installed.
 *
 * This is the invalidation rule, and it is pure so that it can be checked
 * without a CLI on PATH. The rule itself is the load-bearing part: the plugin
 * would rather admit it knows nothing than serve the surface of a release that
 * is no longer the one being run.
 */
export function cliCacheState({ installed, stored, onDisk }) {
  if (!installed) return 'unknown'
  if (!stored || !onDisk) return 'absent'
  return stored === installed ? 'fresh' : 'stale'
}

export function status(data, cwd) {
  const meta = readMeta(data)
  const p = paths(data)
  const version = cliVersion()
  const workspace = findWorkspace(cwd)
  const siblings = siblingWorkspaces(cwd, workspace)

  const cliCached = fs.existsSync(p.tree) && fs.existsSync(p.index)
  const state = cliCacheState({
    installed: version,
    stored: meta.cli?.version || null,
    onDisk: cliCached,
  })
  const cliStale = state === 'stale'

  const pending = []
  if (!version) {
    pending.push({
      id: 'cli-missing',
      severity: 'blocks',
      what: 'the cfour command is not on PATH',
      fix: 'npm i -g cfour-cli',
    })
  }
  if (state === 'stale' || state === 'absent') {
    pending.push({
      id: 'cli-cache-stale',
      severity: 'fixable',
      what: cliStale
        ? `stored knowledge is for version ${meta.cli.version}, installed is ${version}`
        : 'no stored knowledge about the commands yet',
      fix: 'sync',
    })
  }
  if (!blocksOnDisk(data).length) {
    pending.push({
      id: 'doc-missing',
      severity: 'degrades',
      what: 'the format documentation has not been downloaded yet',
      fix: 'sync',
    })
  }
  if (!workspace) {
    pending.push({
      id: 'workspace-missing',
      severity: 'blocks-writing',
      what: siblings.length
        ? `no cfour.yaml from this directory upwards, but this repository already has ` +
          `${siblings.length}: work in one of those unless this is a different system`
        : 'no cfour.yaml from this directory upwards: no workspace governs here',
      fix: 'cfour init',
    })
  }

  return {
    cli: { installed: !!version, version },
    cache: {
      dir: p.root,
      cli: meta.cli,
      cliOnDisk: cliCached,
      cliStale,
      // Counts, not listings. `status` runs once per session and forty-six
      // page names would be forty-six lines saying nothing the caller asked.
      // `doc` with no argument lists them, when someone actually wants them.
      doc: meta.doc
        ? {
            url: meta.doc.url,
            discoveredVia: meta.doc.discoveredVia,
            syncedAt: meta.doc.syncedAt,
            pages: Object.keys(meta.doc.blocks || {}).length,
          }
        : null,
      docOnDisk: blocksOnDisk(data).length,
    },
    repository: {
      cwd,
      workspace,
      root: workspace ? path.dirname(workspace) : null,
      // A repository holds several workspaces side by side. Nothing registers
      // them, so nothing can be asked; these are the ones found by looking.
      siblings,
    },
    pending,
  }
}

// ---------------------------------------------------------------------------
// Search: which command, and which piece of documentation, cover this
// ---------------------------------------------------------------------------

export function search(data, term) {
  const p = paths(data)
  const needle = term.toLowerCase()
  const hits = { commands: [], documentation: [] }

  try {
    for (const line of fs.readFileSync(p.index, 'utf8').split('\n')) {
      if (line.toLowerCase().includes(needle)) hits.commands.push(line.trimEnd())
    }
  } catch {
    /* no index: `sync` fixes it, and `status` already says so */
  }

  const meta = readMeta(data)
  for (const [name, info] of Object.entries(meta.doc?.blocks || {})) {
    const sections = (info.sections || []).filter((s) => s.toLowerCase().includes(needle))
    const inTitle = (info.title || '').toLowerCase().includes(needle)
    let inBody = false
    if (!sections.length && !inTitle) {
      try {
        inBody = fs.readFileSync(blockFile(data, name), 'utf8').toLowerCase().includes(needle)
      } catch {
        inBody = false
      }
    }
    if (sections.length || inTitle || inBody) {
      hits.documentation.push({ block: name, title: info.title, sections })
    }
  }
  return hits
}

// ---------------------------------------------------------------------------
// Command line
// ---------------------------------------------------------------------------

function valueOf(argv, flag) {
  const i = argv.indexOf(flag)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : null
}

function positional(argv) {
  const takesValue = new Set(['--data', '--cwd'])
  const out = []
  for (let i = 0; i < argv.length; i++) {
    if (takesValue.has(argv[i])) { i++; continue }
    if (argv[i].startsWith('--')) continue
    out.push(argv[i])
  }
  return out
}

const HELP = `cfourdev-claude — the plugin's knowledge cache

  status                  what exists, what is missing, and what fixes it
  sync [--force]          refresh knowledge of the CLI and of the documentation
  cli [command...]        help for one command; with no argument, the index
  doc [page]              one documentation page; with no argument, the list
  search <term>           where a subject is covered

  --data <dir>            where to store it (default: CLAUDE_PLUGIN_DATA)
  --cwd <dir>             where to look for cfour.yaml (default: current)
`

async function main() {
  const argv = process.argv.slice(2)
  const data = dataDir(argv)
  const cwd = valueOf(argv, '--cwd') || process.cwd()
  const [command, ...rest] = positional(argv)

  switch (command) {
    case 'status': {
      const s = status(data, cwd)
      process.stdout.write(JSON.stringify(s, null, 2) + '\n')
      return s.pending.some((x) => x.severity === 'blocks') ? 1 : 0
    }

    case 'sync': {
      const meta = readMeta(data)
      const force = argv.includes('--force')
      const rc = syncCli(data, meta)
      const rd = await syncDoc(data, meta, { force })
      writeMeta(data, meta)
      process.stdout.write(JSON.stringify({ cli: rc, doc: rd, cache: paths(data).root }, null, 2) + '\n')
      return rc.ok ? 0 : 1
    }

    case 'cli': {
      const p = paths(data)
      if (!fs.existsSync(p.tree)) {
        process.stderr.write('CLI knowledge not stored yet; run: sync\n')
        return 1
      }
      if (!rest.length) {
        process.stdout.write(fs.readFileSync(p.index, 'utf8'))
        return 0
      }
      const tree = JSON.parse(fs.readFileSync(p.tree, 'utf8'))
      const target = rest[0] === 'cfour' ? rest : ['cfour', ...rest]
      const node = findCommand(tree, target)
      if (!node) {
        process.stderr.write(
          `no command "${target.join(' ')}" in CLI ${tree.version}.\n` + `See the index with: cli\n`
        )
        return 1
      }
      process.stdout.write(renderCommand(node))
      return 0
    }

    case 'doc': {
      const p = paths(data)
      const available = blocksOnDisk(data)
      if (!available.length) {
        process.stderr.write('documentation not downloaded yet; run: sync\n')
        return 1
      }
      if (!rest.length) {
        // One line per page. The sections stay in the metadata, where `search`
        // uses them: printing them all would be several hundred lines, which is
        // the opposite of what this cache is for.
        const meta = readMeta(data)
        for (const name of available) {
          const info = meta.doc?.blocks?.[name] || {}
          process.stdout.write(`${name.padEnd(32)}${info.title || ''}\n`)
        }
        return 0
      }
      const name = rest[0].replace(/^doc:/, '')
      const file = blockFile(data, name)
      if (!available.includes(name) || !fs.existsSync(file)) {
        const near = available.filter((b) => b.includes(name) || name.includes(b)).slice(0, 8)
        process.stderr.write(
          `no page "${name}".` +
            (near.length ? ` Did you mean: ${near.join(', ')}?` : '') +
            `\nSee them all with: doc\n`
        )
        return 1
      }
      process.stdout.write(fs.readFileSync(file, 'utf8'))
      return 0
    }

    case 'search': {
      if (!rest.length) {
        process.stderr.write('search for what?\n')
        return 1
      }
      const r = search(data, rest.join(' '))
      process.stdout.write(JSON.stringify(r, null, 2) + '\n')
      return r.commands.length || r.documentation.length ? 0 : 1
    }

    default:
      process.stdout.write(HELP)
      return command ? 1 : 0
  }
}

// Run as a program; import as a module in the tests.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      process.stderr.write(`failed: ${err.message}\n`)
      process.exit(1)
    }
  )
}

export { findCommand, paths, blockFile }
