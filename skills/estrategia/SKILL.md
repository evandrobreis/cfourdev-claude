---
name: estrategia
description: Propõe a estratégia de modelagem dentro de uma modelagem, a partir do que a descoberta revelou — organização das pastas, projetos, hierarquia inicial, convenções de id, taxonomia mínima e quais visões valem a pena (e quais não). Use depois de cfour:descoberta, ou ao decidir como organizar o model/ de uma modelagem, quantos projetos criar, que tags e metadados adotar, ou quais diagramas e fluxos escrever.
---

# Estratégia de modelagem

Traduza o propósito descoberto em uma proposta de organização — **com
justificativa, alternativa e critério de revisão em cada recomendação**.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`. Consulte
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/viewer-contract.md` para o que pode ser escrito e
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/view-or-flow.md` antes de recomendar qualquer visão.

## Pré-requisito

`$MEM/project-context.yaml` preenchido. Se não existir, ou se `purpose` e
`audiences` estiverem vazios, **pare e chame `cfour:descoberta`**. Estratégia
sem propósito é chute com aparência de método.

Se a modelagem já tiver modelo, comece por
`cfour check --modelagem <id> --inventory --json`: a estratégia precisa partir do que existe,
não de uma folha em branco imaginária.

Esta skill decide a estrutura **dentro de uma modelagem**. Se durante a conversa
aparecer algo que talvez seja outra realidade, isso não é um projeto a mais:
pare e aplique `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md`.

## O que a proposta contém

1. **Unidades de organização em `$M/model/`** — quantas pastas, e o critério.
2. **Candidatos a projeto** — e o que fica em `shared/`.
3. **Elementos potencialmente compartilhados** — quem é citado por mais de um.
4. **Hierarquia inicial** — quem é filho de quem, no nível que se conhece hoje.
5. **Convenções de identificação** — formato de `id`, e o que o `name` carrega.
6. **Taxonomia inicial** — o mínimo de `tags` e `meta`, cada uma com a pergunta
   que responde.
7. **Visões recomendadas** — separadas em diagramas e fluxos.
8. **Visões desnecessárias** — e por que não valem o custo.
9. **Elementos ainda desconhecidos** — o que falta descobrir para detalhar.
10. **Hipóteses e riscos de modelagem.**
11. **Decisões que precisam ser tomadas antes de detalhar.**

## Como organizar `$M/model/`

Critérios possíveis — **nenhum é universal**: sistema · produto · equipe ·
domínio · repositório · ownership · ciclo de vida · autonomia de manutenção ·
necessidade de reutilização · forma de distribuição do modelo.

Distinga seis coisas que costumam ser confundidas. Elas se relacionam, mas não
são equivalentes, e escolher por uma pode estragar outra:

| coisa | pergunta |
|---|---|
| organização dos arquivos | onde é confortável editar |
| organização dos projetos | o que aparece como unidade na barra lateral |
| **organização das modelagens** | **onde muda o propósito, o vocabulário e a memória** |
| boundary arquitetural | onde muda a decisão e o vocabulário |
| ownership | quem é chamado quando quebra |
| estrutura das visões | o que cada desenho abre |

A terceira é a única que esta skill **não** decide: ela é anterior à estratégia,
e vem de `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md`. As outras cinco só fazem sentido
depois de saber em qual modelagem se está.

**Havendo mais de uma organização plausível, apresente as duas.** Assim:

> Existem duas organizações coerentes:
>
> 1. **um projeto por sistema** — favorece boundaries e ownership, e representa
>    melhor a arquitetura;
> 2. **um projeto por time** — favorece manutenção descentralizada e simplifica a
>    governança do repositório.
>
> A primeira representa melhor a arquitetura; a segunda facilita quem mantém.
> Precisamos decidir qual dos dois problemas é o prioritário aqui.

O `cfourdev` aceita as duas: vários projetos convivem no mesmo `model/`, e setas
atravessam projetos normalmente (`estoque/estoque-api`). Times que precisam de
ciclos de revisão independentes ficam em **modelagens** separadas, registradas no
`cfour.yaml` — inclusive em outro repositório (`docs/10`). O que essa
separação cobra é a seta: entre modelagens não existe nenhuma.

## Taxonomia emergente

**Não imponha uma taxonomia completa no começo.** Comece com o mínimo e cresça
conforme aparecer necessidade de filtrar, agrupar, colorir, analisar ou governar.

Antes de criar uma tag ou uma chave de `meta`, responda às sete:

1. que pergunta essa classificação permite responder?
2. é acumulável (`tag`) ou tem nome e valor (`meta`)?
3. será usada para filtro?
4. para agrupamento?
5. para coloração?
6. é estável ou temporária?
7. já existe outra equivalente?

`tags` para sinalizador; `meta` para classificação com valor. Toda chave de `meta`
vira filtro sozinha — o custo de escrever é baixo, o de manter uma taxonomia que
ninguém usa é alto.

Nomes como `migrationWave`, `legacy`, `tenant`, `domain` ou `criticality` **não
são padrão do harness**: só existem se o projeto responder "sim" à pergunta 1.

## Visões

Para cada visão candidata, preencha o `viewProposal` de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/view-or-flow.md` **antes** de recomendá-la. Decida mapa ou história
pela pergunta, nunca por hábito. E recomende explicitamente o que **não** desenhar:

> Não recomendo um diagrama de componentes para `estoque-api` agora. A decisão em
> jogo é sobre a fronteira entre os dois sistemas, e o interior dele não muda essa
> conversa. Quando a discussão virar "onde mora a regra de reserva", ele passa a
> valer.

Lembre que a caixa com filhos e sem diagrama de `scope` é conteúdo inalcançável —
o check avisa. Isso é um argumento para escrever a visão **ou** para não criar a
hierarquia ainda.

## Formato da entrega

Apresente em conversa, não como um documento a aprovar em bloco. Para cada
recomendação:

```
RECOMENDO   ...
PORQUE      ... (ligado ao propósito, não à estética)
CONSIDEREI  ... e seria melhor se ...
REVISE SE   ...
```

Exemplo do tom certo:

> Recomendo representar A e B como sistemas distintos porque têm ownership, ciclo
> de vida e fronteira operacional independentes. É uma **hipótese** baseada no que
> sabemos hoje; revise se eles passarem a compartilhar implantação e
> responsabilidade operacional.

Do tom errado:

> Como este é um projeto de plataforma, crie uma pasta para a plataforma, uma para
> cada legado e uma para migração.

## Peça o sim antes de gravar

O formato `RECOMENDO / PORQUE / CONSIDEREI / REVISE SE` **parece** fechar a
conversa: a alternativa foi honrada, o critério está escrito, e é fácil seguir
como se a escolha tivesse sido feita. Ela não foi. Apresentar duas organizações
com trade-off honesto e fechar sozinho cumpre o guarda-corpo 4 na forma e o
descumpre no ato — a escolha é do arquiteto.

Então, ao fim de cada recomendação estrutural, **pergunte, e espere**:

> Fico com a (1) ou com a (2)? Ou quer pensar e voltar nisto?

E as três respostas vão para lugares diferentes:

| ele disse | a decisão nasce |
|---|---|
| escolheu uma | `status: accepted`, com a data |
| ainda não sabe | `status: proposed` — e um `Q-NNN` em `project-context.yaml` dizendo o que não anda enquanto isso |
| não quer decidir agora, e nada depende disso | nem decisão nem pergunta; só uma linha no `session.yaml` |

**Nunca escreva `accepted` sem ter obtido o sim nesta conversa.** Uma decisão
`accepted` é lida pelas sessões seguintes como escolha do arquiteto, e é a
terceira fonte de autoridade da escada — gravá-la sem o aceite é pôr a sua
inferência três degraus acima de onde ela vive.

## Portão de saída

- Cada escolha estrutural **aceita** vira uma decisão em
  `$MEM/decisions/MD-NNN-*.md` (template no núcleo), com opções
  consideradas e critério de revisão. `accepted` só depois do sim, pela seção
  acima; sem ele, `proposed`.
- **Cada `viewProposal` preenchido foi para algum lugar** — nota `info` presa ao
  diagrama, ou uma linha na decisão de modelagem correspondente
  (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/view-or-flow.md`, passo 5).
  Uma proposta que ficou só na conversa
  evapora, e a visão nasce sem a pergunta que a justificava. Diga, no fecho, onde
  cada uma parou; se nenhuma visão foi recomendada, diga isso também.
- As convenções que passam a valer entram em `$M/model/MODELING-CONVENTIONS.md`.
- O que ficou em aberto vira `Q-NNN` ou `H-NNN` em `project-context.yaml`.
- `session.yaml` recebe `focus` e `next_step` (normalmente
  `cfour:entrevista` para começar a preencher).

Nada de YAML de modelo é escrito aqui — isso é `cfour:editor`.
