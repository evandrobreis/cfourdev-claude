// Os acordos que nenhum compilador reconcilia, num repositorio que nao compila
// nada: aqui tudo e prosa, e prosa que se refere a arquivos.
//
// Cada verificacao existe contra um defeito concreto. As tres primeiras nasceram
// no dia em que as skills sairam do monorepo do cfourdev; as ultimas, no dia em
// que o plugin deixou de recomendar estrategia de modelagem — porque prescricao
// removida de uma skill volta pela outra, e nada reclama.
//
// Sem framework e sem dependencia: `node --test`. Todo teste acumula uma lista e
// falha UMA vez com a lista inteira — a mensagem mostra todos os defeitos de uma
// vez, em vez do primeiro.
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

/**
 * Todo arquivo do repositorio, e nao so a prosa das skills: residuo de endereco
 * tambem mora em README, workflow e script, que `textos()` nao alcanca.
 */
function arquivos(dir = RAIZ) {
  const achados = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules' || e.name === '.claude') continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) achados.push(...arquivos(p))
    else achados.push(p)
  }
  return achados
}

const rel = (p) => path.relative(RAIZ, p).split(path.sep).join('/')

/** As linhas de um arquivo, com o numero — para apontar o defeito onde ele mora. */
const linhasDe = (f) => fs.readFileSync(f, 'utf8').split('\n')

// ---------------------------------------------------------------------------
// O que existe, e se refere ao que existe
// ---------------------------------------------------------------------------

test('toda skill tem frontmatter, e o name e o nome do diretorio', () => {
  // O `name` do frontmatter VENCE o nome do diretorio como ultimo segmento do
  // comando. Divergindo, `/cfour:operar` chama uma skill e o texto que manda
  // usar `cfour:operar` aponta para outra — e nada reclama.
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

/** Nomenclatura, e nao arquivo: `decisions/MD-NNN-slug.md`, `<projeto>/...`. */
const EH_PADRAO = (alvo) => /NN|YYYY|AAAA|<[a-z]|\bslug\b|\bid\b|\bprojeto\b/.test(alvo)

test('todo ${CLAUDE_PLUGIN_ROOT} citado aponta para um arquivo que existe', () => {
  // Um `${CLAUDE_PLUGIN_ROOT}` errado nao falha: a skill simplesmente nao le a
  // referencia e segue sem ela.
  const quebrados = []
  for (const f of textos()) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const [, alvo] of texto.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/g)) {
      const limpo = alvo.replace(/[.,;)]+$/, '')
      if (EH_PADRAO(limpo)) continue
      if (!fs.existsSync(path.join(RAIZ, limpo))) quebrados.push(`${rel(f)}: ${limpo}`)
    }
  }
  assert.deepEqual(quebrados, [])
})

/**
 * O unico prefixo que resolve FORA do plugin: `model/…` e caminho dentro de uma
 * modelagem, e `.claude/cfour/…` e a memoria e o cache no repositorio de quem
 * documenta. Os dois so existem em tempo de conversa.
 */
const FORA_DO_PLUGIN = [/^model\//, /^\.claude\/cfour\//, /^\.claude\/c4-harness\//]

/**
 * Nomes que sao arquivos DO USUARIO, e nao deste repositorio. O registro, a
 * identidade, a configuracao, os arquivos de memoria e o cache da CLI nascem no
 * repositorio de quem documenta; `view.yaml` vem dentro do `cfour`.
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
  'manifest.yaml',
  'help.json',
  // Arquivos que a contextualizacao manda LER no repositorio do arquiteto antes
  // de perguntar. Sao dele, e nenhum deles mora aqui.
  'docker-compose.yml',
  'package.json',
])

test('todo caminho de arquivo citado entre crases existe', () => {
  // Dois formatos: com barra, e o nome nu — que foi acrescentado depois de uma
  // skill citar cinco arquivos que nem moravam no diretorio dela.
  const COM_BARRA = /`([\w./-]+\/[\w.-]+\.(?:md|yaml|yml|json|mjs))`/g
  const NOME_NU = /`([\w-]+\.(?:md|yaml|yml|json|mjs))`/g

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

test('toda skill citada como cfour:<nome> existe', () => {
  // O roteamento do nucleo e uma tabela de nomes. Renomear uma skill e esquecer
  // a tabela produz um encaminhamento para o nada, que o modelo resolve
  // improvisando — o pior modo de falhar, porque parece que funcionou.
  const inexistentes = []
  for (const f of [...textos(), path.join(RAIZ, 'README.md')]) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const [, alvo] of texto.matchAll(/\bcfour:([a-z][a-z-]*)/g)) {
      if (alvo === '*' || nomes.includes(alvo)) continue
      inexistentes.push(`${rel(f)}: cfour:${alvo}`)
    }
  }
  assert.deepEqual(inexistentes, [])
})

test('as skills e o README concordam sobre quais skills existem', () => {
  // O README e a unica porta de entrada de quem ainda nao instalou. Uma skill
  // que existe e nao esta la e uma skill que ninguem descobre.
  const readme = fs.readFileSync(path.join(RAIZ, 'README.md'), 'utf8')
  const ausentes = nomes.filter((n) => !readme.includes(`cfour:${n}`))
  assert.deepEqual(ausentes, [], 'skills que o README nao menciona')
})

// ---------------------------------------------------------------------------
// O invariante — a razao de este plugin ter sido reescrito
// ---------------------------------------------------------------------------

test('o nucleo declara o invariante, e diz o que continua sendo do agente', () => {
  // Sem esta frase escrita onde o modelo a le antes de tudo, o resto do plugin e
  // um conjunto de skills educadas — e educacao nao impede uma inferencia.
  const nucleo = fs.readFileSync(path.join(SKILLS, 'modelagem', 'SKILL.md'), 'utf8')
  assert.match(nucleo, /PERGUNTE\. N[ÃA]O DECIDA/i, 'o nucleo nao declara o invariante')
  assert.match(nucleo, /infer[êe]ncia/i, 'o nucleo nao nomeia a inferencia')
  // A metade que evita o defeito oposto: um plugin que pergunta qual comando
  // rodar nao entregou nada.
  assert.match(nucleo, /como executar/i, 'o nucleo nao diz o que continua sendo do agente')
})

test('o C4 esta escrito como guarda-corpo, e cobre as abstracoes', () => {
  // O caso que motivou a reescrita: o agente decidiu sozinho que algo era um
  // Container. Este arquivo existe para que ele saiba o que Container e — e para
  // que saiba que saber nao autoriza classificar.
  const f = path.join(SKILLS, 'modelagem', 'references', 'c4.md')
  assert.ok(fs.existsSync(f), 'o reference do C4 sumiu')
  const c4 = fs.readFileSync(f, 'utf8')

  const ABSTRACOES = ['Person', 'Software System', 'Container', 'Component', 'Code']
  assert.deepEqual(
    ABSTRACOES.filter((a) => !c4.includes(a)),
    [],
    'abstracoes que o reference nao cobre',
  )
  assert.match(c4, /nunca decide/i, 'o reference nao proibe a classificacao autonoma')
  // A origem conceitual, para o arquiteto poder conferir o que o plugin afirmou.
  assert.ok(c4.includes('https://c4model.com/'), 'o reference nao cita a origem das definicoes')
})

test('nao voltou nenhuma regra prescritiva', () => {
  // Prescricao removida de uma skill volta pela outra. Cada padrao aqui esteve
  // escrito neste repositorio, e cada um autorizava o agente a decidir modelagem
  // ou arquitetura no lugar do arquiteto.
  const PROIBIDO = [
    [/\bdescobrir antes de prescrever\b/i, 'o principio antigo pressupunha que o plugin prescreve'],
    [/\bestrat[ée]gia de modelagem\b/i, 'a estrategia de modelagem e do arquiteto'],
    [/\bplano de ondas\b|\bonda \d\b/i, 'as ondas eram o plano de escrita que o agente montava'],
    [/\bperfil\s+`?(leve|intermediario|intermediário|profundo)`?/i, 'a calibragem do processo saiu'],
    [/\bqual\s+voc[êe]\s+escolheria\b/i, 'recomendar a propria escolha era a regra que saiu'],
    [/\brecomendo\s+(a|o|uma|um|representar|separar|criar)\b/i, 'recomendacao de modelagem e prescricao'],
    [/\bdiga qual voc[êe]\b/i, 'idem'],
    [/\bcheckpoint \d\b/i, 'os cinco checkpoints eram a jornada em sete etapas'],
    [/\bviewProposal\b/, 'a proposta de visao era o agente decidindo quais desenhos existem'],
  ]

  // Os tres arquivos cujo TRABALHO e nomear o que saiu: sem poder escrever
  // `strategy`, `complexity` e `waves`, eles nao conseguem dizer que aqueles
  // blocos, encontrados numa memoria antiga, nao pautam mais nada — e a
  // prescricao voltaria pelo unico caminho que uma reescrita de skills nao
  // fecha, que e o disco de quem ja usou o plugin.
  const PODEM_NOMEAR_O_QUE_SAIU = new Set([
    path.join(SKILLS, 'modelagem', 'references', 'memoria.md'),
    path.join(SKILLS, 'sessao', 'SKILL.md'),
    path.join(SKILLS, 'modelagem', 'references', 'templates', 'project-context.yaml'),
  ])

  const sobras = []
  for (const f of [...textos(), path.join(RAIZ, 'README.md')]) {
    if (PODEM_NOMEAR_O_QUE_SAIU.has(f)) continue
    linhasDe(f).forEach((linha, i) => {
      // Linha marcada como contraexemplo mostra a forma errada de proposito. Um
      // plugin que ensina pelo par ✅/❌ nao pode ser proibido de escrever o ❌.
      if (linha.includes('❌')) return
      for (const [re, porque] of PROIBIDO) {
        if (re.test(linha)) sobras.push(`${rel(f)}:${i + 1}: ${porque} — ${linha.trim().slice(0, 70)}`)
      }
    })
  }
  assert.deepEqual(sobras, [])

  // E a excecao nao pode virar permissao geral: os tres arquivos so podem
  // nomear o vocabulario antigo para REBAIXA-LO, e cada um diz isso com todas
  // as letras.
  for (const f of PODEM_NOMEAR_O_QUE_SAIU) {
    assert.match(
      fs.readFileSync(f, 'utf8'),
      /nunca instru[çc][ãa]o|n[ãa]o (pautam|guarda|existe)|hist[óo]ria do que/i,
      `${rel(f)} nomeia o que saiu sem dizer que aquilo nao vale mais`,
    )
  }
})

// ---------------------------------------------------------------------------
// A CLI e a fonte — e a rede nao e
// ---------------------------------------------------------------------------

test('nada busca documentacao na rede', () => {
  // A decisao: quem descreve a ferramenta e a propria ferramenta. As paginas de
  // `/docs/` sairam do ar, o payload para agentes descreve uma versao anterior a
  // instalada, e um endereco sobrevivente manda o agente ler o contrato errado —
  // ou concluir que um campo nao existe.
  const PROIBIDO = [
    [/llms(-full)?\.txt/i, 'o plugin nao busca mais o payload de documentacao'],
    [/cfourdev\.com\.br\/docs/i, 'as paginas de documentacao nao respondem mais'],
    [/\bdoc:[a-z]/, 'a marca `doc:<slug>` apontava para paginas que sairam do ar'],
    [/\bdocs-cache\b(?!\/`? *—| e resquicio)/i, 'o cache da documentacao virou cache da CLI'],
  ]
  // As duas skills que precisam FALAR do cache antigo para oferecer a limpeza.
  const PODEM_CITAR_O_CACHE_ANTIGO = new Set([
    path.join(SKILLS, 'cli', 'SKILL.md'),
    path.join(SKILLS, 'setup', 'SKILL.md'),
    path.join(SKILLS, 'modelagem', 'references', 'memoria.md'),
  ])

  const sobras = []
  for (const f of arquivos()) {
    if (f === fileURLToPath(import.meta.url)) continue
    if (!/\.(md|yaml|yml|json|mjs)$/.test(f)) continue
    linhasDe(f).forEach((linha, i) => {
      for (const [re, porque] of PROIBIDO) {
        if (porque.includes('cache da CLI') && PODEM_CITAR_O_CACHE_ANTIGO.has(f)) continue
        if (re.test(linha)) sobras.push(`${rel(f)}:${i + 1}: ${porque} — ${linha.trim().slice(0, 70)}`)
      }
    })
  }
  assert.deepEqual(sobras, [])
})

test('a skill da CLI declara o comando, o cache e a invalidacao', () => {
  // Sem estes tres, a skill vira uma recomendacao vaga de "consulte a CLI" — e o
  // modo de falhar e o mesmo de antes: o plugin decora comandos que envelhecem.
  const cli = fs.readFileSync(path.join(SKILLS, 'cli', 'SKILL.md'), 'utf8')
  const CONTRATO = [
    ['cfour help --output json', 'o comando que descreve a arvore inteira'],
    ['.claude/cfour/cli-cache/', 'onde o cache mora'],
    ['cfour_version', 'o campo que decide se o cache vale'],
    ['cfour config show', 'o que responde pelos valores desta modelagem'],
    ['cfour help formato', 'as regras que o --help de comando nao cabe'],
  ]
  const ausentes = CONTRATO.filter(([marca]) => !cli.includes(marca))
  assert.deepEqual(
    ausentes.map(([m, porque]) => `${m} (${porque})`),
    [],
    'o que a skill da CLI deixou de declarar',
  )
})

test('a operacao passa pela CLI antes do YAML', () => {
  // O defeito que a versao anterior tinha por desenho: escrever YAML a mao
  // enquanto a CLI ja sabia criar tudo. Um plugin que reimplementa as regras do
  // formato mantem uma segunda verdade, que envelhece sozinha.
  const operar = fs.readFileSync(path.join(SKILLS, 'operar', 'SKILL.md'), 'utf8')
  const nucleo = fs.readFileSync(path.join(SKILLS, 'modelagem', 'SKILL.md'), 'utf8')
  assert.match(nucleo, /A CLI é a API/i, 'o nucleo nao declara a CLI como API')
  for (const cmd of ['cfour element add', 'cfour relation add', 'cfour diagram add', 'cfour flow add']) {
    assert.ok(operar.includes(cmd), `a operacao nao conhece \`${cmd}\``)
  }
  assert.match(operar, /--dry-run/, 'a operacao nao mostra o efeito antes de gravar')
  assert.match(operar, /cfour check/, 'a operacao nao valida depois de escrever')
})

// ---------------------------------------------------------------------------
// O estado persistido
// ---------------------------------------------------------------------------

const tpl = (nome) => path.join(SKILLS, 'modelagem', 'references', 'templates', nome)

test('o estado que as skills citam existe nos templates, e vice-versa', () => {
  // Uma skill que manda gravar um bloco que o template nao tem produz memoria com
  // formato inventado, e cada sessao inventa o seu. O contrato do estado e o
  // template — e bloco que nenhuma skill preenche e contrato morto.
  const contexto = fs.readFileSync(tpl('project-context.yaml'), 'utf8')
  const sessao = fs.readFileSync(tpl('session.yaml'), 'utf8')

  const BLOCOS = [
    ['objetivo', contexto],
    ['elementos_conhecidos', contexto],
    ['tecnologias', contexto],
    ['fontes', contexto],
    ['questions', contexto],
    ['last_operation', sessao],
    ['model_fingerprint', sessao],
  ]
  const ausentes = BLOCOS.filter(([chave, arq]) => !new RegExp(`^${chave}:`, 'm').test(arq))
  assert.deepEqual(
    ausentes.map(([c]) => c),
    [],
    'blocos que as skills escrevem e o template nao declara',
  )

  const todas = textos()
    .filter((f) => f.endsWith('SKILL.md') || f.endsWith('memoria.md'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n')
  const orfaos = BLOCOS.map(([c]) => c).filter((c) => !todas.includes(c))
  assert.deepEqual(orfaos, [], 'blocos de estado que nenhuma skill menciona')
})

test('os blocos da versao anterior estao marcados como historia, nao como pauta', () => {
  // Memoria antiga continua no disco de quem ja usou o plugin. Se `strategy` e
  // `complexity` forem lidos como instrucao, a prescricao volta pela memoria —
  // que e o unico caminho que uma reescrita de skills nao fecha sozinha.
  const memoria = fs.readFileSync(path.join(SKILLS, 'modelagem', 'references', 'memoria.md'), 'utf8')
  const sessao = fs.readFileSync(path.join(SKILLS, 'sessao', 'SKILL.md'), 'utf8')
  for (const bloco of ['strategy', 'complexity', 'workflow']) {
    assert.ok(memoria.includes(bloco), `\`memoria.md\` nao diz o que fazer com \`${bloco}\``)
    assert.ok(sessao.includes(bloco), `a retomada nao diz o que fazer com \`${bloco}\``)
  }
  assert.match(memoria, /nunca instru[çc][ãa]o/i, '`memoria.md` nao rebaixa os blocos antigos')
})

// ---------------------------------------------------------------------------
// O que sai do repositorio
// ---------------------------------------------------------------------------

test('nao sobrou nada das versoes anteriores', () => {
  const PROIBIDO = [
    [/c4-harness(?!\/modelagens)/, 'o harness virou plugin ha muitas versoes'],
    [/\.claude\/skills\//, 'skills de plugin ficam em ${CLAUDE_PLUGIN_ROOT}/skills/'],
    [/npm run check/, 'no repositorio do usuario o comando e `cfour check`'],
    [/npm run dev/, 'no repositorio do usuario o comando e `cfour serve`'],
    [/\bc4-(model|modeling|resume|close|reconcile|modelagens|architecture)/, 'nome de skill antigo'],
    [/\bexemplos-c4\b/, 'os exemplos moram em `references/exemplos.md`'],
    [/\b(qual|que)\s+slug\b/i, 'identificador derivavel se propoe, nao se pergunta'],
  ]
  // A migracao precisa nomear o endereco antigo para poder oferecer o `git mv`.
  const MIGRACAO = path.join(SKILLS, 'setup', 'SKILL.md')

  const sobras = []
  for (const f of textos()) {
    linhasDe(f).forEach((linha, i) => {
      if (linha.includes('❌')) return
      for (const [re, porque] of PROIBIDO) {
        if (f === MIGRACAO && /c4-harness/.test(String(re))) continue
        if (re.test(linha)) sobras.push(`${rel(f)}:${i + 1}: ${porque} — ${linha.trim().slice(0, 70)}`)
      }
    })
  }
  assert.deepEqual(sobras, [])
})

test('nenhuma URL aponta para fora dos dominios previstos', () => {
  // Um endereco fixado no texto vira fonte sem que ninguem tenha decidido isso —
  // e da 404 na cara de quem instalou, meses depois.
  const HOSTS = new Set([
    'cfourdev.com.br',
    'app.cfourdev.com.br',
    'c4model.com',
    'github.com',
    'www.npmjs.com',
    'exemplo.interno',
  ])
  const problemas = []
  for (const f of [...textos(), path.join(RAIZ, 'README.md')]) {
    linhasDe(f).forEach((linha, i) => {
      for (const [, host] of linha.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)(\/\S*)?/g)) {
        if (!HOSTS.has(host)) problemas.push(`${rel(f)}:${i + 1}: host ${host}`)
      }
    })
  }
  assert.deepEqual(problemas, [])
})

test('nada aponta para um repositorio que o leitor nao pode abrir', () => {
  // Este plugin e publico; o repositorio do cfourdev nao e. Um link para la nao
  // falha em lugar nenhum: da 404 na cara de quem instalou, meses depois.
  const proibidas = []
  for (const f of [...textos(), path.join(RAIZ, 'README.md')]) {
    linhasDe(f).forEach((linha, i) => {
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

test('os manifestos parseiam, e o marketplace aponta para um plugin de verdade', () => {
  const plugin = JSON.parse(fs.readFileSync(path.join(RAIZ, '.claude-plugin', 'plugin.json'), 'utf8'))
  const market = JSON.parse(fs.readFileSync(path.join(RAIZ, '.claude-plugin', 'marketplace.json'), 'utf8'))

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
