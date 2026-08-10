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
const FORA_DO_PLUGIN = [
  /^model\//,
  // A memoria e o cache da documentacao moram no repositorio de quem modela.
  // O contrato deles e conferido pelos testes de estado e de cache, abaixo.
  /^\.claude\/cfour\//,
]

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
  // O manifesto do cache da documentacao nasce em `.claude/cfour/docs-cache/`
  // do repositorio de quem modela — nao existe aqui, e citar pelo nome nu e o
  // certo, como os quatro arquivos de memoria acima.
  'manifest.yaml',
  // O nome ANTIGO do payload, que a `0.5.0` aposentou. Continua citado de
  // proposito: o cenario `19` planta um cache nesse formato, e a skill de
  // documentacao explica o que fazer ao encontrar um. O nome de hoje —
  // `llms-full.txt` — nao precisa de entrada nenhuma, porque os dois regexes
  // abaixo so casam `md|yaml|yml|json|mjs`.
  'for-agents.md',
  // Arquivos que a cobertura tecnica manda LER no repositorio do arquiteto
  // antes de perguntar. Sao dele, e nenhum deles mora aqui.
  'docker-compose.yml',
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
    // O setup mandava, com todas as letras, "pergunte o slug em vez de
    // inventa-lo". Era a estrategia sendo terceirizada para quem pediu ajuda
    // com ela, e voltar a escrever isso desfaz `decisoes-de-quem.md` inteiro.
    // Contraexemplo marcado com ❌ passa: e assim que a regra se ensina.
    [/\b(qual|que)\s+slug\b/i, 'identificador derivavel se propoe, nao se pergunta', 'eval-ok'],
    [/em vez de invent[áa]-lo/i, 'identificador derivavel se propoe, nao se pergunta', 'eval-ok'],
  ]
  // `cfour:setup` e a UNICA skill que pode falar do endereco antigo e da palavra
  // antiga: o trabalho dela e achar a memoria que ficou la e oferecer a
  // migracao, e explicar POR QUE o nome mudou. Proibir as strings nela seria
  // proibir a migracao — e quem tem a pasta antiga e exatamente quem nao percebe
  // que a perdeu.
  const MIGRACAO = path.join(SKILLS, 'setup', 'SKILL.md')
  const SO_NA_MIGRACAO = /c4-harness|\\bharness\\b/

  // O eval DESCREVE a falha para poder pontua-la: a rubrica precisa escrever
  // "que slug quer?" na coluna do que reprova, e um cenario precisa poder
  // armar a armadilha. Proibir a string ali seria proibir o teste do defeito.
  const EVAL = path.join(SKILLS, 'avaliar')

  const sobras = []
  for (const f of textos()) {
    const linhas = fs.readFileSync(f, 'utf8').split('\n')
    linhas.forEach((linha, i) => {
      // Linha marcada como contraexemplo mostra a forma errada de proposito. Um
      // plugin que ensina pelo par ✅/❌ nao pode ser proibido de escrever o ❌.
      if (linha.includes('❌')) return
      for (const [re, porque, excecao] of PROIBIDO) {
        if (f === MIGRACAO && SO_NA_MIGRACAO.test(String(re))) continue
        if (excecao === 'eval-ok' && f.startsWith(EVAL)) continue
        if (re.test(linha)) sobras.push(`${rel(f)}:${i + 1}: ${porque} — ${linha.trim().slice(0, 70)}`)
      }
    })
  }
  assert.deepEqual(sobras, [])
})

// ---------------------------------------------------------------------------
// A jornada, os perfis e a cobertura: tres vocabularios fechados que varias
// skills escrevem na memoria de outra pessoa. Um nome divergente nao falha em
// lugar nenhum — ele produz uma sessao que retoma na etapa errada, ou um perfil
// que ninguem reconhece na sessao seguinte.
// ---------------------------------------------------------------------------

const ETAPAS = [
  'enquadramento',
  'calibragem',
  'descoberta',
  'estrategia',
  'confirmacao',
  'escrita',
  'encerramento',
]

const PERFIS = ['leve', 'intermediario', 'profundo']

const AREAS = [
  'estrutura-funcional',
  'aplicacoes',
  'dados',
  'integracoes',
  'infraestrutura',
  'seguranca',
  'operacao',
]

const ref = (nome) => path.join(SKILLS, 'modelagem', 'references', nome)
const tpl = (nome) => path.join(SKILLS, 'modelagem', 'references', 'templates', nome)

test('a jornada declara as sete etapas, e ninguem cita etapa fora delas', () => {
  const jornada = fs.readFileSync(ref('jornada.md'), 'utf8')
  const naoDeclaradas = ETAPAS.filter((e) => !jornada.includes(`\`${e}\``))
  assert.deepEqual(naoDeclaradas, [], 'etapas que `jornada.md` nao declara')

  // `current_stage: escrit`, `next_stage: revisao` e afins: nomes que uma skill
  // manda gravar e a retomada nao sabe interpretar.
  const invalidas = []
  for (const f of textos()) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const [, campo, valor] of texto.matchAll(
      /\b(current_stage|next_stage):\s*([a-z][a-z-]*)/g,
    )) {
      if (!ETAPAS.includes(valor)) invalidas.push(`${rel(f)}: ${campo}: ${valor}`)
    }
    for (const [, lista] of texto.matchAll(/\bcompleted_stages:\s*\[([^\]]+)\]/g)) {
      for (const item of lista.split(',').map((s) => s.trim()).filter(Boolean)) {
        if (!ETAPAS.includes(item)) invalidas.push(`${rel(f)}: completed_stages: ${item}`)
      }
    }
  }
  assert.deepEqual(invalidas, [])
})

test('os tres perfis sao os mesmos na calibragem, no template e nas skills', () => {
  const calibragem = fs.readFileSync(ref('calibragem.md'), 'utf8')
  const contexto = fs.readFileSync(tpl('project-context.yaml'), 'utf8')

  const semSecao = PERFIS.filter((p) => !calibragem.includes(`### \`${p}\``))
  assert.deepEqual(semSecao, [], 'perfis sem secao propria em `calibragem.md`')

  const comentario = contexto.match(/profile:.*#\s*(.+)$/m)?.[1] ?? ''
  const doTemplate = comentario.split('|').map((s) => s.trim())
  assert.deepEqual(doTemplate, PERFIS, 'o template oferece perfis diferentes dos da calibragem')

  const invalidos = []
  for (const f of textos()) {
    const texto = fs.readFileSync(f, 'utf8')
    for (const [, valor] of texto.matchAll(/\bprofile:\s*([a-z][a-z-]*)/g)) {
      if (!PERFIS.includes(valor)) invalidos.push(`${rel(f)}: profile: ${valor}`)
    }
  }
  assert.deepEqual(invalidos, [])
})

test('as sete areas de cobertura tecnica batem com as do template', () => {
  const cobertura = fs.readFileSync(ref('cobertura-tecnica.md'), 'utf8')
  const semSecao = AREAS.filter((a) => !cobertura.includes(`### \`${a}\``))
  assert.deepEqual(semSecao, [], 'areas sem secao em `cobertura-tecnica.md`')

  const contexto = fs.readFileSync(tpl('project-context.yaml'), 'utf8')
  const bloco = contexto.split('technical_coverage:')[1]?.split(/\n# ---/)[0] ?? ''
  const doTemplate = [...bloco.matchAll(/^ {2}([a-z][a-z-]*):/gm)].map((m) => m[1])
  assert.deepEqual(doTemplate, AREAS, 'o template cobre areas diferentes da referencia')
})

test('o estado persistido que as skills citam existe nos templates', () => {
  // Uma skill que manda gravar `strategy.status` num template que nao tem
  // `strategy` produz memoria com formato inventado, e cada sessao inventa o
  // seu. O contrato do estado e o template.
  const contexto = fs.readFileSync(tpl('project-context.yaml'), 'utf8')
  const sessao = fs.readFileSync(tpl('session.yaml'), 'utf8')

  const BLOCOS = [
    ['complexity', contexto],
    ['technical_coverage', contexto],
    ['strategy', contexto],
    ['workflow', sessao],
    ['consulted_docs', sessao],
  ]
  const ausentes = BLOCOS.filter(([chave, arq]) => !new RegExp(`^${chave}:`, 'm').test(arq))
  assert.deepEqual(
    ausentes.map(([c]) => c),
    [],
    'blocos que as skills escrevem e o template nao declara',
  )

  // E o inverso: bloco no template que nenhuma skill sabe preencher e contrato
  // morto, que envelhece sem ninguem perceber.
  const todas = textos()
    .filter((f) => f.endsWith('SKILL.md'))
    .map((f) => fs.readFileSync(f, 'utf8'))
    .join('\n')
  const orfaos = BLOCOS.map(([c]) => c).filter((c) => !todas.includes(c))
  assert.deepEqual(orfaos, [], 'blocos de estado que nenhuma skill menciona')
})

test('a documentacao oficial e a unica fonte, e o cache tem contrato', () => {
  const doc = fs.readFileSync(path.join(SKILLS, 'documentacao', 'SKILL.md'), 'utf8')

  assert.ok(
    doc.includes('https://cfourdev.com.br/docs/'),
    'a skill de documentacao nao declara a origem oficial',
  )
  assert.ok(
    doc.includes('.claude/cfour/docs-cache/'),
    'a skill de documentacao nao declara onde o cache mora',
  )
  // Sem estes campos o cache e uma copia sem procedencia: no dia em que ele
  // contradisser o site, ninguem sabe qual das duas envelheceu.
  const METADADOS = ['source:', 'url:', 'fetched_at:', 'content_hash:', 'status:', 'failures:']
  const semMetadado = METADADOS.filter((m) => !doc.includes(m))
  assert.deepEqual(semMetadado, [], 'campos que o manifesto do cache precisa declarar')
})

test('a escolha de versionar o cache e oferecida onde o cache nasce, e tem endereco', () => {
  // Tres execucoes independentes criaram o `docs-cache/` versionado sem dizer
  // que havia escolha ali. Nenhuma delas foi descuidada: a instrucao morava no
  // FIM da secao de politica de atualizacao, longe do passo que cria o
  // diretorio — quem le a skill de cima para baixo ja gravou o cache quando
  // chega a frase que manda oferecer.
  //
  // O contrato aqui e fraco de proposito, no espirito do teste do estado
  // persistido: nao da para afirmar que o agente vai anunciar, mas da para
  // afirmar que a oferta esta no passo certo e que o que a skill manda gravar
  // tem endereco.
  const doc = fs.readFileSync(path.join(SKILLS, 'documentacao', 'SKILL.md'), 'utf8')

  const procedimento = doc.split('\n## Procedimento')[1]?.split('\n## ')[0] ?? ''
  assert.ok(procedimento, 'a skill de documentacao perdeu a secao `## Procedimento`')
  for (const marca of ['.gitignore', 'git_decidido_por']) {
    assert.ok(
      procedimento.includes(marca),
      `o passo que cria o cache nao menciona \`${marca}\``,
    )
  }

  // E o que ela manda gravar precisa existir no manifesto: a escolha ACRESCENTA
  // aos tres campos de procedencia, e nao os substitui.
  const manifesto = doc.split('### `manifest.yaml`')[1]?.split('\n### ')[0] ?? ''
  const CAMPOS = ['source:', 'fetched_at:', 'content_hash:', 'git:', 'git_decidido_por:']
  const ausentes = CAMPOS.filter((c) => !manifesto.includes(c))
  assert.deepEqual(ausentes, [], 'campos que o exemplo do `manifest.yaml` deixou de declarar')

  // Os dois valores de cada campo escritos por extenso: `git: versionado`
  // sozinho nao distingue escolha feita de escolha herdada, e e essa diferenca
  // que decide se a proxima sessao volta a oferecer.
  const VALORES = ['versionado', 'ignorado', 'default', 'arquiteto']
  const semValor = VALORES.filter((v) => !manifesto.includes(v))
  assert.deepEqual(semValor, [], 'valores que os campos da escolha admitem e o manifesto nao mostra')
})

test('a skill e o contrato citam o endereco unico da documentacao', () => {
  // O agente busca UM arquivo, e nao doze paginas: para saber qual pagina
  // responde a duvida ja era preciso conhecer a resposta, e o modo de falhar era
  // concluir que o campo nao existe.
  //
  // Nao ha teste possivel do outro lado — o gerador da doc mora noutro
  // repositorio, e este roda sem rede de proposito. O que da para afirmar aqui e
  // que o endereco esta escrito onde o modelo vai le-lo.
  const ENDERECO = 'https://cfourdev.com.br/llms-full.txt'
  const onde = [
    path.join(SKILLS, 'documentacao', 'SKILL.md'),
    path.join(SKILLS, 'modelagem', 'references', 'viewer-contract.md'),
  ]
  const ausentes = onde.filter((f) => !fs.readFileSync(f, 'utf8').includes(ENDERECO))
  assert.deepEqual(ausentes.map(rel), [], 'arquivos que nao citam o endereco unico')
})

test('a skill reconhece o payload de hoje, e o cache que ela mesma escreve', () => {
  // Tres strings que so o outro repositorio conhece, e que este nao tem como
  // conferir por HTTP: o marcador da primeira linha do payload, as marcas que
  // separam os blocos dentro dele, e a versao do manifesto do cache.
  //
  // Congelar aqui nao prova que o gerador emite isso — prova que, no dia em que
  // alguem mexer num dos tres, o outro lado nao muda sozinho e em silencio.
  const doc = fs.readFileSync(path.join(SKILLS, 'documentacao', 'SKILL.md'), 'utf8')

  const CONTRATO = [
    'cfourdev-llms: v1', // o marcador da primeira linha; o `v1` e do FORMATO
    '<!-- cli -->', // o `cfour --help` embutido no payload
    '<!-- exemplos -->', // as duas modelagens completas
    'version: 3', // o formato do manifesto que a skill grava
  ]
  const ausentes = CONTRATO.filter((c) => !doc.includes(c))
  assert.deepEqual(ausentes, [], 'o que a skill de documentacao deixou de declarar')
})

test('nada manda buscar a pagina de exemplos, que deixou de existir', () => {
  // Os trinta YAMLs viraram um bloco do `llms-full.txt`. Um `doc:exemplos`
  // sobrevivente manda o agente a uma URL que responde 404 — e o resultado e uma
  // linha em `failures:`, que e falha silenciosa do tipo que a skill de
  // documentacao existe para evitar.
  const restos = []
  for (const f of textos()) {
    const linhas = fs.readFileSync(f, 'utf8').split('\n')
    linhas.forEach((linha, i) => {
      if (/doc:exemplos|\/docs\/exemplos/.test(linha)) restos.push(`${rel(f)}:${i + 1}`)
    })
  }
  assert.deepEqual(restos, [])
})

test('nenhuma URL de documentacao aponta para fora do dominio oficial', () => {
  // Uma doc privada fixada no texto vira fonte primaria sem que ninguem tenha
  // decidido isso — e da 404 na cara de quem instalou o plugin.
  const HOSTS = new Set([
    'cfourdev.com.br',
    'app.cfourdev.com.br',
    'github.com',
    'www.npmjs.com',
    'exemplo.interno',
  ])
  const problemas = []
  for (const f of [...textos(), path.join(RAIZ, 'README.md')]) {
    const linhas = fs.readFileSync(f, 'utf8').split('\n')
    linhas.forEach((linha, i) => {
      for (const [url, host] of linha.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)(\/\S*)?/g)) {
        if (!HOSTS.has(host)) problemas.push(`${rel(f)}:${i + 1}: host ${host}`)
        // `/docs` pega a pagina para citar; `/llms*.txt` pega o payload, que mora
        // na RAIZ do site — a guarda antiga so olhava o caminho `/docs` e deixava
        // passar um `https://app.cfourdev.com.br/llms-full.txt`, que e host
        // permitido e documentacao errada.
        if (/\/docs?\b|\/llms(-full)?\.txt\b/.test(url) && host !== 'cfourdev.com.br') {
          problemas.push(`${rel(f)}:${i + 1}: documentacao fora do dominio oficial — ${url}`)
        }
      }
    })
  }
  assert.deepEqual(problemas, [])
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

test('a descoberta pergunta o que o leitor vai querer isolar, colorir e abrir', () => {
  // O silencio de que ninguem reclama. Um modelo sai correto e cinza, sem filtro
  // util, sem cor e sem link — e o arquiteto nao diz "voce nao perguntou da cor",
  // porque quem nunca abriu o viewer nao sabe que ela existe. Diferente da
  // cobertura tecnica, que ele lembra sozinho ("voce nao perguntou do Kafka").
  const REF = path.join(SKILLS, 'modelagem', 'references', 'classificacao.md')
  assert.ok(fs.existsSync(REF), 'o reference da classificacao sumiu')

  const ref = fs.readFileSync(REF, 'utf8')
  const eixos = ['localizar', 'filtrar', 'colorir', 'linkar']
  assert.deepEqual(
    eixos.filter((e) => !ref.includes(`### \`${e}\``)),
    [],
    'eixos que o reference nao cobre',
  )

  const descoberta = fs.readFileSync(path.join(SKILLS, 'descoberta', 'SKILL.md'), 'utf8')
  assert.ok(
    descoberta.includes('references/classificacao.md'),
    'a descoberta nao chama o reference da classificacao',
  )
  // O portao: sem isto o eixo vira uma secao que se pula quando a conversa
  // aperta, e e exatamente quando ela aperta que ele e esquecido.
  assert.match(descoberta, /classification/, 'a descoberta nao grava o que ouviu')
})

test('a estrategia recomenda a taxonomia, e diz o que a cor exige', () => {
  const estrategia = fs.readFileSync(path.join(SKILLS, 'estrategia', 'SKILL.md'), 'utf8')
  // Responder "sim, essa chave e colorivel" nao produzia efeito nenhum no modelo
  // escrito: sem `color: true` no workspace.yaml a chave filtra e nao colore, e
  // nao ha aviso nenhum.
  assert.ok(estrategia.includes('color: true'), 'a estrategia nao diz o que a cor exige')
  assert.ok(
    estrategia.includes('classification'),
    'a estrategia nao le nem preenche o bloco da memoria',
  )
})

test('o editor sabe que `metadata` tambem se declara', () => {
  // A lista dizia `shape`, `kind` e `outcome`. `metadata` faltava — e falha de
  // outro jeito, mais calado: a chave continua filtrando, so nao colore, e o
  // modelo esta certo.
  const editor = fs.readFileSync(path.join(SKILLS, 'editor', 'SKILL.md'), 'utf8')
  assert.ok(editor.includes('metadata'), 'o editor nao manda declarar metadata')
})

test('o template de memoria tem onde gravar a classificacao', () => {
  // Sem endereco na memoria, a taxonomia decidida nao e lida pelo editor nem
  // comparada pelo reconciliar: ela vive so na conversa que a decidiu.
  const template = fs.readFileSync(
    path.join(SKILLS, 'modelagem', 'references', 'templates', 'project-context.yaml'),
    'utf8',
  )
  const campos = ['classification:', 'axes:', 'artifacts:', 'keys:']
  assert.deepEqual(
    campos.filter((c) => !template.includes(c)),
    [],
    'campos que o template nao declara',
  )
})
