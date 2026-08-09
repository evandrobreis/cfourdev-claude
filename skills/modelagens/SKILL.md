---
name: modelagens
description: Lista, cria, troca e registra modelagens no cfourdev — as realidades independentes que um arquiteto mantém em paralelo, cada uma com propósito, vocabulário, convenções e memória próprios. Use ao começar a modelar algo que talvez não pertença à modelagem aberta, ao voltar sem saber em qual realidade estava, ao apontar o plugin para uma modelagem que mora em outro repositório, ou quando pedirem /cfour:modelagens.
---

# Modelagens

Uma **modelagem** é uma realidade: propósito, audiência, glossário, taxonomia,
convenções e memória próprios. Um arquiteto mantém N delas, relacionadas ou não.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md` — em especial a seção **A
modelagem ativa**, que define a ordem de resolução que esta skill administra.

Esta skill não escreve YAML de modelo e não conduz descoberta. Ela cuida do
registry e do esqueleto; o **porquê** de uma modelagem existir é
`cfour:descoberta`.

## Quando NÃO usar

- Já se sabe em qual modelagem se está e o assunto é o modelo → a skill do
  assunto (`cfour:entrevista`, `cfour:editor`, …).
- A dúvida é se algo novo é uma modelagem ou um projeto → decida primeiro por
  `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md`, e volte aqui só
  se a resposta for "modelagem".
- Voltando a um trabalho anterior sem saber onde parou → `cfour:retomar`, que já
  lista as modelagens e pergunta qual retomar.

## O registry

`cfour.yaml`. É o **único** caminho resolvido pelo
diretório de trabalho — o loader sobe a árvore a partir do cwd até achá-lo.

```yaml
version: 1
active: arquitetura
modelagens:
  - id: arquitetura
    name: Arquitetura do produto
    path: ./arquitetura
  - id: cliente-acme
    name: Arquitetura da Acme
    path: ~/Git/acme-arquitetura        # outro repositorio, mesma anatomia
```

`path` aceita relativo à raiz do repo, absoluto e `~`, e aponta só para o
**modelo**. A **memória** não está aqui: é derivada do `id`, sempre em
`.claude/cfour/history/<id>/`. É isso que permite registrar uma
modelagem que mora em outro repositório e ainda assim ter memória dela.

## Listar

```bash
cfour check --all
```

Para cada modelagem registrada, leia também `focus` e `next_step` de
`$MEM/session.yaml` e apresente:

```
MODELAGENS
  ● arquitetura              Arquitetura do produto
      onde parou: <focus>
      próximo:    <next_step>
      modelo:     N caixa(s), N diagrama(s), N fluxo(s)
    cliente-acme             Arquitetura da Acme
      ...
```

`●` marca a ativa. Uma entrada cujo `path` não existe aparece marcada como
**ausente** — não some da lista e não vira erro silencioso.

## Criar

Antes de criar, faça as duas perguntas de corte de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md`: alguma modelagem existente já é essa
realidade, e o que vai precisar atravessar — e **quantas vezes**. Seta direta
entre modelagens não existe; o que atravessa é um espelho (`bind`), declarado à
mão, um por vizinho. Um punhado é o preço de manter duas réguas; uma dúzia
significa que era uma modelagem só com dois projetos. Nomeie o número em voz
alta antes que o arquiteto escolha.

O esqueleto, e nada além dele:

```
<path do registro>/                  o modelo — `./<slug>` é o default do `cfour init`
  modelagem.yaml                     id, name, description, status
  model/
    workspace.yaml                   só version e title — o vocabulário nasce vazio

.claude/cfour/history/<slug>/      a memória
  project-context.yaml               do template, com purpose ainda unknown
  session.yaml                       do template
  decisions/                         vazio; a numeração MD-NNN começa em 001 AQUI
```

As duas pastas nascem juntas e são nomeadas pelo mesmo `<slug>` — que é o `id`.
Criar uma sem a outra é criar modelo sem porquê, ou memória órfã.

Templates em `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/templates/`.

Regras:

- **`id` em kebab-case**, único no registry, estável. Ele aparece na URL do
  viewer (`#/<modelagem>/<projeto>/<visão>`), em todo comando e no **nome da
  pasta da memória**; renomear depois quebra links que alguém já compartilhou, e
  desliga a memória do modelo até alguém renomear a pasta junto.
- **O `id` se propõe, não se pergunta — e só depois que o assunto tem nome.**
  Derive-o do assunto que a conversa já nomeou — produto, sistema, iniciativa —,
  apresente com o custo acima junto, e siga
  (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/decisoes-de-quem.md`). Só peça escolha manual quando o id
  derivado colidir com um já registrado, quando dois nomes forem igualmente
  plausíveis, ou quando houver convenção interna que você não conhece.
- **A ordem é essa, e não se inverte**: a descoberta enquadra → o assunto ganha
  nome → o `id` se propõe → o registro nasce. Registrar antes é fixar a decisão
  mais cara da modelagem no ponto de menor informação, com o nome do diretório no
  lugar do nome do assunto — e o nome do diretório é o do repositório, que muitas
  vezes não é o da modelagem. Chegou aqui sem assunto nomeado? O passo é
  `cfour:descoberta`, não `Criar`.
- **Nada de `MODELING-CONVENTIONS.md` no nascimento.** Convenção só entra depois
  que uma decisão a criou. Um arquivo de convenções que ninguém decidiu é
  prescrição disfarçada de memória.
- **Nada de projeto no nascimento.** Quantos projetos, e por qual critério, é
  pergunta de `cfour:estrategia` — depois da descoberta.
- Registrada a modelagem, o próximo passo é quase sempre
  `cfour:descoberta` **nela**.

## Trocar a ativa

Duas formas, e elas servem a coisas diferentes:

| quero | faço |
|---|---|
| mudar de realidade de vez | `active:` no registry — vai para o git, é uma afirmação sobre onde o trabalho está |
| olhar outra por um momento | `C4_MODELAGEM=<id>` no comando, ou o seletor no viewer |
| ler uma pasta que nem está no registro | `C4_ROOT=/caminho/model` — vence tudo acima, e não registra nada |

Ao trocar, **anuncie a troca** e recarregue a memória da nova: contexto,
convenções e decisões da anterior deixam de valer inteiramente. Não carregue
hipótese, pergunta aberta nem glossário de uma para outra — é exatamente o tipo
de vazamento que esta camada existe para impedir.

## Registrar uma que já existe

Uma modelagem em outro repositório entra com uma linha no registry, desde que
tenha `model/` e `modelagem.yaml`. A memória dela **não vem junto** — ela nasce
aqui, em `.claude/cfour/history/<id>/`, vazia. Diga isso ao registrar, e
ofereça `cfour:descoberta` para dar a ela um porquê antes de continuar.

Se a modelagem vem de um repositório que já era modelado com o cfour, a memória
antiga está lá e não vem sozinha: copiá-la para `.claude/cfour/history/<id>/`
daqui é ato deliberado, e vale confirmar com o arquiteto que aquele contexto ainda
descreve a realidade que ele quer retomar.

## Remover

Tirar do registry **não apaga nada**, e é assim que deve ser: uma modelagem
encerrada continua sendo o histórico de uma decisão. Prefira `status: archived`
em `modelagem.yaml` a remover a entrada. Apagar arquivos é decisão do arquiteto,
nunca sua.

## O que nunca fazer aqui

- Criar uma modelagem sem ter feito as duas perguntas de corte.
- Criar uma modelagem porque o assunto tem rótulo novo. Rótulo dispara
  investigação, nunca estrutura.
- Copiar `project-context.yaml`, convenções ou decisões de uma modelagem para
  outra. Se as duas precisam da mesma decisão, elas provavelmente eram uma só.
- Escrever no modelo. Isso é `cfour:editor`, dentro de uma modelagem.
