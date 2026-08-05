// Os acordos que nenhum compilador reconcilia, num repositorio que nao compila
// nada: aqui tudo e prosa, e prosa que se refere a arquivos.
//
// Cada verificacao existe contra um defeito concreto, e os tres primeiros sao a
// razao de este arquivo ter sido escrito no dia em que as skills sairam do
// monorepo do cfourdev:
//
//   1. la elas se citavam por `.claude/skills/c4-harness/...`, caminho que nao
//      existe dentro do cache do plugin. Um `${CLAUDE_PLUGIN_ROOT}` errado nao
//      falha: a skill simplesmente nao le a referencia e segue sem ela;
//   2. a substituicao mecanica de onze nomes deixa residuo, e residuo de
//      substituicao ja foi achado duas vezes neste projeto — pelo lint, que aqui
//      nao existe;
//   3. `npm run check` so existia no monorepo. No repositorio de quem instala o
//      plugin ele nao existe, e o comando certo e `cfour check`.
//
// Sem framework e sem dependencia: `node --test`, como no cfourdev. Todo teste
// acumula uma lista e falha UMA vez com a lista inteira — a mensagem mostra
// todos os defeitos de uma vez, em vez do primeiro.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS = path.join(RAIZ, 'skills')

/** Os nomes de skill que existem, que sao os nomes dos diretorios. */
const nomes = fs
  .readdirSync(SKILLS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort()

/** Todo arquivo de texto do plugin, com o caminho relativo a raiz. */
function textos(dir = SKILLS) {
  const achados = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) achados.push(...textos(p))
    else if (/\.(md|yaml|yml)$/.test(e.name)) achados.push(p)
  }
  return achados
}

const rel = (p) => path.relative(RAIZ, p).split(path.sep).join('/')

// ---------------------------------------------------------------------------

test('toda skill tem frontmatter, e o name e o nome do diretorio', () => {
  // O `name` do frontmatter VENCE o nome do diretorio como ultimo segmento do
  // comando. Divergindo, `/cfour:editor` chama uma skill e o texto que manda
  // usar `cfour:editor` aponta para outra — e nada reclama.
  const problemas = []
  for (const nome of nomes) {
    const f = path.join(SKILLS, nome, 'SKILL.md')
    if (!fs.existsSync(f)) {
      problemas.push(`${nome}: sem SKILL.md`)
      continue
    }
    const texto = fs.readFileSync(f, 'utf8')
    const m = texto.match(/^---\n([\s\S]*?)\n---/)
    if (!m) {
      problemas.push(`${nome}: sem frontmatter`)
      continue
    }
    const declarado = m[1].match(/^name:\s*(.+)$/m)?.[1]?.trim()
    const descricao = m[1].match(/^description:\s*(.+)$/m)?.[1]?.trim()
    if (declarado !== nome) problemas.push(`${nome}: name: ${declarado ?? '(ausente)'}`)
    if (!descricao) problemas.push(`${nome}: sem description`)
    // A description e o unico texto que o modelo le antes de decidir invocar a
    // skill. Uma linha curta demais nao diz quando usar.
    else if (descricao.length < 80) problemas.push(`${nome}: description curta demais`)
  }
  assert.deepEqual(problemas, [])
})

/** Nomenclatura, e nao arquivo: `decisions/MD-NNN-slug.md`, `scenarios/NN-*.md`. */
const EH_PADRAO = (alvo) => /NN|YYYY|AAAA|<[a-z]|\bslug\b|\bid\b|\bprojeto\b/.test(alvo)

test('todo ${CLAUDE_PLUGIN_ROOT} citado aponta para um arquivo que existe', () => {
  const quebrados = []
  for (const f of textos()) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const [, alvo] of texto.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/g)) {
      const limpo = alvo.replace(/[.,;)]+$/, '')
      if (EH_PADRAO(limpo)) continue
      // Um diretorio citado com barra no fim e referencia a pasta, nao a arquivo.
      if (!fs.existsSync(path.join(RAIZ, limpo))) quebrados.push(`${rel(f)}: ${limpo}`)
    }
  }
  assert.deepEqual(quebrados, [])
})

/**
 * O unico prefixo que resolve FORA do plugin.
 *
 * `model/…` e caminho dentro de uma modelagem, relativo ao `model/` dela: quem
 * resolve e o repositorio de quem esta modelando, que so existe em tempo de
 * conversa.
 *
 * `docs/…` estava aqui e saiu: a documentacao do cfourdev virou publica, e as
 * marcas viraram `doc:<slug>` — conferiveis pelo teste dos slugs, abaixo.
 */
const FORA_DO_PLUGIN = [/^model\//]

/**
 * Nomes que sao arquivos DO USUARIO, e nao deste repositorio.
 *
 * O registro, a identidade, a configuracao e os quatro arquivos de memoria
 * nascem no repositorio de quem esta modelando; `view.yaml` vem dentro do
 * `cfour`. Citar qualquer um deles pelo nome nu e o certo — e eles sao a razao
 * de a checagem de nome nu precisar de uma lista, em vez de proibir a forma.
 */
const DO_USUARIO = new Set([
  'cfour.yaml',
  'modelagem.yaml',
  'workspace.yaml',
  'folder.yaml',
  'view.yaml',
  'project-context.yaml',
  'session.yaml',
  'MODELING-CONVENTIONS.md',
])

test('todo caminho de arquivo citado entre crases existe', () => {
  // Dois formatos, e o segundo foi acrescentado depois de uma skill citar cinco
  // arquivos pelo nome nu — arquivos que nem moravam no diretorio dela. A versao
  // antiga exigia uma barra, entao `view-or-flow.md` passava batido.
  //
  // Resolve contra a raiz e contra o proprio diretorio, que e como as
  // referencias do nucleo sao escritas.
  const COM_BARRA = /`([\w./-]+\/[\w.-]+\.(?:md|yaml|yml|json|mjs))`/g
  const NOME_NU = /`([\w-]+\.(?:md|yaml|yml|mjs))`/g

  const quebrados = []
  for (const f of textos()) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const re of [COM_BARRA, NOME_NU]) {
      for (const [, alvo] of texto.matchAll(re)) {
        if (EH_PADRAO(alvo)) continue
        if (DO_USUARIO.has(alvo)) continue
        if (FORA_DO_PLUGIN.some((r) => r.test(alvo))) continue
        const candidatos = [path.resolve(RAIZ, alvo), path.resolve(path.dirname(f), alvo)]
        if (!candidatos.some((c) => fs.existsSync(c))) quebrados.push(`${rel(f)}: ${alvo}`)
      }
    }
  }
  assert.deepEqual(quebrados, [])
})

/**
 * Os slugs da documentacao publica.
 *
 * A MESMA lista esta congelada em `tests/contracts/documentacao-publica.test.ts`
 * do cfourdev. Duas copias em dois repositorios e exatamente o desenho: nenhum
 * dos dois pode importar o outro, e um acordo assim ou e afirmado dos dois lados
 * ou nao e afirmado em lugar nenhum.
 *
 * Conferir por HTTP seria mais forte e nao vale: poria rede num teste que roda
 * em todo push, para pegar um erro que so acontece quando alguem renomeia um
 * documento — e quem renomeia ve o dourado do outro lado falhar primeiro.
 */
const SLUGS = [
  'conceitos',
  'primeiros-passos',
  'modelagem',
  'diagramas',
  'fluxos',
  'usando-o-viewer',
  'configuracao',
  'referencia',
  'perguntas-frequentes',
  'modelagens',
  'publicando',
  'exemplos',
]

test('toda marca doc: aponta para um documento que existe', () => {
  const invalidas = []
  for (const f of textos()) {
    const linhas = fs.readFileSync(f, 'utf8').split('\n')
    linhas.forEach((linha, i) => {
      for (const [, slug] of linha.matchAll(/\bdoc:([a-z][a-z-]*)/g)) {
        if (!SLUGS.includes(slug)) invalidas.push(`${rel(f)}:${i + 1}: doc:${slug}`)
      }
    })
  }
  assert.deepEqual(invalidas, [])
})

test('a tabela de slugs do contrato lista todos, e so eles', () => {
  // O contrato traz a lista para o leitor, e ela e o que ensina a resolver
  // `doc:<slug>`. Uma lista incompleta manda o modelo adivinhar o endereco.
  const contrato = fs.readFileSync(
    path.join(SKILLS, 'modelagem', 'references', 'viewer-contract.md'),
    'utf8',
  )
  const ausentes = SLUGS.filter((s) => !contrato.includes(`| \`${s}\` |`))
  assert.deepEqual(ausentes, [], 'slugs que a tabela do contrato nao lista')
})

test('toda skill citada como cfour:<nome> existe', () => {
  // O roteamento do nucleo e uma tabela de nomes. Renomear uma skill e esquecer
  // a tabela produz um encaminhamento para o nada, que o modelo resolve
  // improvisando — o pior modo de falhar, porque parece que funcionou.
  const inexistentes = []
  for (const f of textos()) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const [, alvo] of texto.matchAll(/\bcfour:([a-z][a-z-]*)/g)) {
      if (alvo === '*' || nomes.includes(alvo)) continue
      inexistentes.push(`${rel(f)}: cfour:${alvo}`)
    }
  }
  assert.deepEqual(inexistentes, [])
})

test('nao sobrou nada do monorepo', () => {
  // A substituicao mecanica de onze nomes, dois caminhos e um comando. O que
  // sobra aqui nao quebra ruidosamente: manda ler um arquivo que nao existe, ou
  // rodar um script que so existia no repositorio de origem.
  const PROIBIDO = [
    [/c4-harness/, 'o harness virou plugin: nao ha mais `c4-harness`'],
    [/\.claude\/skills\//, 'skills de plugin ficam em ${CLAUDE_PLUGIN_ROOT}/skills/'],
    [/npm run check/, 'no repositorio do usuario o comando e `cfour check`'],
    [/npm run dev/, 'no repositorio do usuario o comando e `cfour serve`'],
    [/\bc4-(model|modeling|resume|close|reconcile|modelagens|architecture)/, 'nome de skill antigo'],
    [/(?<!\/)\bexamples\/<(?:id|slug)>/, '`examples/` era pasta do monorepo; o modelo vem do `path:` do registro'],
    // `docs/NN` apontava para a documentacao dentro do repositorio PRIVADO do
    // cfourdev. Ela e publica agora, e a marca e `doc:<slug>` — que o teste dos
    // slugs confere. Escrever `docs/08` de novo seria voltar a citar um endereco
    // que o leitor deste plugin nao pode abrir.
    [/\bdocs\/\d\d\b/, 'a marca agora e `doc:<slug>`, e resolve em cfourdev.com.br/docs'],
    // Enquanto as skills moravam num diretorio do monorepo, "harness" era o nome
    // certo. Hoje isto e um plugin, e o README ja diz isso em toda parte.
    [/\bharness\b/i, 'isto e um plugin, e nao um harness'],
    // A modelagem de exemplo do cfourdev nao esta no repositorio de ninguem.
    [/\bexemplos-c4\b/, 'os exemplos moram em `references/exemplos.md` e em doc:exemplos'],
  ]
  // `cfour:setup` e a UNICA skill que pode falar do endereco antigo e da palavra
  // antiga: o trabalho dela e achar a memoria que ficou la e oferecer a
  // migracao, e explicar POR QUE o nome mudou. Proibir as strings nela seria
  // proibir a migracao — e quem tem a pasta antiga e exatamente quem nao percebe
  // que a perdeu.
  const MIGRACAO = path.join(SKILLS, 'setup', 'SKILL.md')
  const SO_NA_MIGRACAO = /c4-harness|\\bharness\\b/

  const sobras = []
  for (const f of textos()) {
    const linhas = fs.readFileSync(f, 'utf8').split('\n')
    linhas.forEach((linha, i) => {
      for (const [re, porque] of PROIBIDO) {
        if (f === MIGRACAO && SO_NA_MIGRACAO.test(String(re))) continue
        if (re.test(linha)) sobras.push(`${rel(f)}:${i + 1}: ${porque} — ${linha.trim().slice(0, 70)}`)
      }
    })
  }
  assert.deepEqual(sobras, [])
})

test('os manifestos parseiam, e o marketplace aponta para um plugin de verdade', () => {
  const pluginFile = path.join(RAIZ, '.claude-plugin', 'plugin.json')
  const marketFile = path.join(RAIZ, '.claude-plugin', 'marketplace.json')
  const plugin = JSON.parse(fs.readFileSync(pluginFile, 'utf8'))
  const market = JSON.parse(fs.readFileSync(marketFile, 'utf8'))

  assert.equal(plugin.name, 'cfour', 'o nome do plugin e o namespace de toda skill')
  // Sem `version`, todo commit vira uma versao nova para quem instalou.
  assert.match(plugin.version, /^\d+\.\d+\.\d+$/)
  assert.ok(market.name && market.owner?.name && Array.isArray(market.plugins))

  for (const p of market.plugins) {
    const destino = path.resolve(RAIZ, p.source)
    assert.ok(
      fs.existsSync(path.join(destino, '.claude-plugin', 'plugin.json')),
      `source "${p.source}" nao tem .claude-plugin/plugin.json`,
    )
  }
  assert.ok(
    market.plugins.some((p) => p.name === plugin.name),
    'o marketplace nao lista o plugin deste repositorio',
  )
})

test('nada aponta para um repositorio que o leitor nao pode abrir', () => {
  // Este plugin e publico; o repositorio do cfourdev nao e. Um link para la nao
  // falha em lugar nenhum: da 404 na cara de quem instalou, meses depois, e o
  // texto em volta continua parecendo certo.
  //
  // O mesmo vale para URL com tag: `blob/v0.3.0/` so resolve depois de a tag
  // existir, e uma tag prometida no texto e uma tag que ninguem lembra de criar.
  const proibidas = []
  for (const f of [...textos(), path.join(RAIZ, 'README.md')]) {
    const linhas = fs.readFileSync(f, 'utf8').split('\n')
    linhas.forEach((linha, i) => {
      if (/github\.com\/evandrobreis\/cfourdev(?!-claude)/.test(linha)) {
        proibidas.push(`${rel(f)}:${i + 1}: o repositorio do cfourdev e privado`)
      }
      if (/github\.com\/[\w-]+\/[\w-]+\/blob\/v\d/.test(linha)) {
        proibidas.push(`${rel(f)}:${i + 1}: URL fixada numa tag que pode nao existir`)
      }
    })
  }
  assert.deepEqual(proibidas, [])
})

test('as skills e o README concordam sobre quais skills existem', () => {
  // O README e a unica porta de entrada de quem ainda nao instalou. Uma skill
  // que existe e nao esta la e uma skill que ninguem descobre.
  const readme = fs.readFileSync(path.join(RAIZ, 'README.md'), 'utf8')
  const ausentes = nomes.filter((n) => !readme.includes(`cfour:${n}`))
  assert.deepEqual(ausentes, [], 'skills que o README nao menciona')
})

test('o eval nao manda escrever no repositorio sob teste', () => {
  // A versao antiga criava as modelagens de avaliacao dentro do repositorio e
  // mandava apagar "ao final", em prosa. Com N subagentes em paralelo, uma
  // rodada que falhe no meio deixa o registro de alguem cheio de lixo de teste.
  const texto = fs.readFileSync(path.join(SKILLS, 'avaliar', 'SKILL.md'), 'utf8')
  assert.match(texto, /diret[óo]rio tempor[áa]rio/i)
  assert.ok(
    !/entradas do registry/.test(texto),
    'o eval ainda fala em apagar entradas do registro do repositorio',
  )
})
