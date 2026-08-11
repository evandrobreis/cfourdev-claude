---
name: contexto
description: Entende o software que está sendo documentado e o objetivo da documentação, por rodadas curtas de perguntas e pela leitura das fontes que já existem no repositório — e registra o que apurou como fato, sem decidir nada sobre como aquilo será representado. Use ao começar a documentar um sistema no cfourdev, quando faltar informação para executar um pedido, ou quando aparecer uma área do software que ninguém tinha mencionado.
---

# Contextualização — a Fase A

Você precisa entender **o que está sendo documentado** e **para que a documentação
serve**, com clareza suficiente para interpretar corretamente os pedidos do
arquiteto. Só isso.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md` — em especial o
invariante. Esta skill **não escreve nada no modelo**: ela preenche
`$MEM/project-context.yaml`.

> **Descobrir que algo existe não autoriza decidir como representá-lo.** Saber que
> há um Kafka, um módulo de autorização ou um BFF preenche o contexto; a abstração
> C4, o `parent` e o nível continuam sendo decisão do arquiteto
> (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/c4.md`).

## Quando usar, e quanto

Esta fase **não é um portão que se atravessa uma vez**. Ela roda quando falta
contexto, e apenas sobre o que falta.

O critério de parada é um só:

> **Há clareza suficiente para executar corretamente o próximo trabalho pedido?**

Se sim, avance para `cfour:operar`. Não é preciso conhecer o software inteiro
antes de começar. Se depois aparecer uma área desconhecida, faça uma clarificação
**localizada** — não recomece a entrevista.

Sempre há mais uma pergunta possível. O que decide se ela vale é se a resposta
**muda o que vai ser escrito**.

## Antes de perguntar, leia

A maior parte das respostas está no ambiente. Pergunte se existem fontes que
ajudem a entender o sistema, e **leia as que estiverem acessíveis**:

`README` · documentação técnica · ADRs · diagramas anteriores · código-fonte ·
manifests de Kubernetes · Terraform · `docker-compose.yml` · OpenAPI · AsyncAPI ·
documentação de APIs · arquivos de configuração · documentos de negócio · outros
repositórios · modelos C4 já existentes.

Se a modelagem já tiver modelo, comece por
`cfour check --modelagem <id> --inventory --json`: perguntar o que o arquivo já
responde queima a paciência de quem já respondeu.

O que vem de lá é **evidência** (`status: evidence`), e se apresenta assim:

> ✅ "Encontrei manifests de PostgreSQL e Redis. Isso diz que os dois existem;
> ainda não sei se pertencem a este recorte, nem como você quer representá-los."

> ❌ "A arquitetura usa PostgreSQL e Redis, e ambos serão modelados."

## O que você precisa entender

Quatro frentes. Elas não são uma escada, e a conversa vai pular entre elas —
percorra **na medida do que o trabalho pedido exige**.

### 1. Visão geral

O que está sendo documentado: qual produto, plataforma, sistema ou conjunto de
sistemas. Que problema de negócio ele resolve.

### 2. Contexto de negócio

Quais usuários e atores existem · quais capacidades estão envolvidas · quais
conceitos de negócio importam · quais fronteiras **já são conhecidas** · quais
sistemas externos participam.

Fronteira que ainda não está decidida **não vira hierarquia**: vira uma dúvida
registrada.

### 3. Contexto técnico

Tecnologias · aplicações · serviços · bancos · filas · tópicos · integrações ·
protocolos · infraestrutura relevante · aplicações de terceiros · sistemas
legados · componentes conhecidos.

Percorra as sete áreas de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/perguntas.md` na medida do
caso — muitas vezes uma pergunta agrupada fecha quase tudo. **Área verificada que
não se aplica se registra, com o porquê**; área relevante que fica desconhecida
**se diz em voz alta**.

### 4. Objetivo da documentação

Por que os diagramas estão sendo criados · quem vai consumi-los · o que o
arquiteto pretende explicar · qual escopo está sendo documentado · quais
diagramas ele pretende manter, quando isso já estiver definido · qual estado está
sendo documentado — atual, transição, alvo ou outro — quando houver mais de um.

Estas respostas servem para **interpretar pedidos futuros**. Elas não autorizam
você a decidir quais diagramas deveriam existir.

## Como conduzir

**No máximo três perguntas por rodada.** Interrogatório mata a conversa, e uma boa
resposta costuma reordenar as perguntas seguintes.

Depois de cada rodada:

1. **consolide** — devolva curto o que entendeu, com as palavras dele;
2. **marque o estado** — `FATO` (ele afirmou), `EVIDÊNCIA` (você leu), `DÚVIDA`
   (ninguém sabe). Nunca misture os três num parágrafo liso;
3. **identifique** o que ficou ambíguo, o que ficou contraditório, e o que ainda
   **impede** executar o que foi pedido;
4. **grave** em `$MEM/project-context.yaml`. Não acumule na conversa: se a sessão
   cair, o que se apurou se perde;
5. **decida se há próxima rodada** — só se algo do passo 3 ainda travar o
   trabalho.

Contradição não se resolve sozinha. *"Você disse antes que o `auth` roda dentro da
API; agora aparece um deployment próprio para ele. Qual dos dois vale hoje?"*

Quando um rótulo aparecer — plataforma, legado, componentização, jornada,
migração —, **devolva o termo** e registre a definição local no `glossary`. Rótulo
dispara pergunta, nunca estrutura
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/perguntas.md`).

## O que registrar

Em `$MEM/project-context.yaml` (template e regras em
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/memoria.md`):

`objetivo` · `audiences` · `scope` · `sistema` · `tecnologias` ·
`elementos_conhecidos` · `fontes` · `glossary` · `questions`.

**`elementos_conhecidos` é a linha que mais importa aqui**: ela guarda o que se
sabe que existe **sem** dizer como será representado. O campo `representacao` só
é preenchido depois que o arquiteto decidir, e é `cfour:operar` que o preenche ao
materializar.

Grave o que a conversa tocou. O que ninguém conversou fica **ausente** — encher o
arquivo de `unknown` produz um documento que parece completo e não é.

## O que nunca fazer aqui

- Propor projetos, hierarquia, taxonomia, visões ou qualquer estrutura.
- Concluir a abstração C4 de qualquer coisa, ainda que como "hipótese" ou
  "sugestão". Uma classificação apresentada como hipótese continua sendo a sua
  classificação.
- Recomendar quais diagramas valem a pena, ou como o modelo deveria ser
  organizado.
- Opinar sobre a arquitetura: decomposição, fronteiras, ownership, granularidade.
- Apresentar evidência lida no repositório com a mesma cara de fato afirmado.
- Transformar as frentes acima em formulário lido em voz alta.
- Continuar perguntando depois que já há clareza para executar o que foi pedido.
- Gravar sem ter resolvido em qual modelagem você está.
