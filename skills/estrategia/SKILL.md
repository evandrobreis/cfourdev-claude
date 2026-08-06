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

## O que a proposta contém — na medida do perfil

A lista abaixo é o teto, não o piso. **O perfil gravado em `complexity`
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/calibragem.md`) decide quanto dela vale a pena escrever**: com
perfil `leve`, os itens 1, 5, 7 e 12 cabem em um parágrafo e o resto é ruído;
com perfil `profundo`, todos existem, e os itens 1 e 2 vêm com alternativa
comparada.

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
12. **O plano de ondas** — o recorte inicial e o que vem depois (abaixo).

## O plano de ondas

A escrita não é um bloco: é uma sequência de ondas com objetivo e critério de
conclusão (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/jornada.md`). **A estratégia é onde elas nascem**,
porque é aqui que se sabe qual recorte responde primeiro à pergunta do
arquiteto.

Para cada onda, três linhas: o que entra, o que a fecha, e o que ela deixa de
fora de propósito.

> **Onda 1** — contexto: os quatro sistemas, os dois atores e o que atravessa a
> fronteira; um diagrama de topo. Fecha quando o comitê consegue discutir o
> recorte olhando o desenho. Fora: qualquer container.
>
> **Onda 2** — abrir `cobranca` e `faturamento` em containers, com a fila entre
> eles. Fecha quando nenhuma integração conhecida ficou sem seta.

Perfil `leve` costuma ter uma onda e meia; perfil `profundo`, uma por recorte.
Prometer seis ondas para um app de três devs é o mesmo erro que escrever tudo de
uma vez para uma plataforma.

## Antes de recomendar um recurso do formato

Se a proposta depende de algo que o cfourdev talvez faça — agrupar por metadado,
colorir por chave, espelhar entre modelagens, um `outcome` de fluxo que você não
usou ainda —, **confirme antes de prometer**: `cfour:documentacao` consulta a doc
oficial e registra a fonte. Recomendar um recurso que não existe é pior do que
não recomendar nada: a estratégia inteira passa a depender dele.

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

**Havendo mais de uma organização plausível, apresente as duas — e diga qual
você escolheria.** Um menu sem recomendação devolve ao arquiteto a decisão que
ele pediu ajuda para tomar
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/decisoes-de-quem.md`, classe A). Assim:

> Existem duas organizações coerentes:
>
> 1. **um projeto por sistema** — favorece boundaries e ownership, e representa
>    melhor a arquitetura;
> 2. **um projeto por time** — favorece manutenção descentralizada e simplifica a
>    governança do repositório.
>
> **Recomendo a primeira**: a decisão em jogo é sobre fronteira entre sistemas, e
> a segunda transformaria uma reorganização de times numa reescrita do modelo. A
> segunda passa a ser melhor se cada time tiver ciclo de revisão próprio, o que
> hoje não acontece. **Alguma convenção interna ou restrição que invalide isso?**

Do jeito errado — honrar a alternativa e sumir com o julgamento:

> ❌ "Precisamos decidir qual dos dois problemas é o prioritário aqui."
> ❌ "Como você prefere organizar?"

A escolha continua sendo dele: recomendar é dar a ele **algo concreto para
recusar**. Se o trade-off depender de um fato que só ele tem, pergunte **pelo
fato** — "os dois domínios são revisados no mesmo pull request hoje?" —, dizendo
o que você faria com cada resposta.

O `cfourdev` aceita as duas: vários projetos convivem no mesmo `model/`, e setas
atravessam projetos normalmente (`estoque/estoque-api`). Times que precisam de
ciclos de revisão independentes ficam em **modelagens** separadas, registradas no
`cfour.yaml` — inclusive em outro repositório (`doc:modelagens`). O que essa
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
são padrão do plugin**: só existem se o projeto responder "sim" à pergunta 1.

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

## O checkpoint — recomende, e espere a objeção

O formato `RECOMENDO / PORQUE / CONSIDEREI / REVISE SE` **parece** fechar a
conversa: a alternativa foi honrada, o critério está escrito, e é fácil seguir
como se a escolha tivesse sido feita. Ela não foi. Uma decisão estrutural gravada
como aceita sem que o arquiteto tenha dito nada põe a sua inferência três degraus
acima de onde ela vive.

Este é o **checkpoint 3** da jornada, e é um dos cinco lugares em que se para e se
espera resposta. A pergunta que fecha uma recomendação estrutural é pela
objeção, não pela escolha:

> Vou seguir com a (1). Alguma restrição, convenção interna ou preferência que
> torne isso inadequado?

E as respostas vão para lugares diferentes:

| ele disse | a decisão nasce |
|---|---|
| concordou, ou não objetou depois de ver a recomendação | `status: accepted`, com a data |
| trouxe uma restrição | recalcule, recomende de novo, e registre a restrição em `strategy.user_constraints` |
| **"decide você"** | `status: accepted` — a decisão é sua, e a justificativa junto. Não devolva a pergunta |
| ainda não sabe, e algo depende disso | `status: proposed` + `Q-NNN` dizendo o que não anda enquanto isso |
| não quer decidir agora, e nada depende disso | nem decisão nem pergunta; só uma linha no `session.yaml` |

**"Decide você" é uma resposta, não uma recusa a responder.** Devolver a pergunta
nesse ponto é a falha que este checkpoint existe para não cometer.

**Nunca escreva `accepted` sem ter apresentado a recomendação nesta conversa** —
o aceite pode ser silencioso, a recomendação não pode.

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
- **O bloco `strategy` de `project-context.yaml` fica preenchido**:
  `recommended_structure`, `alternatives`, `rationale`, `user_constraints`,
  `waves`, `decision_ref` e `status` (`proposed` | `validated` | `superseded`).
  É daqui que `cfour:editor` lê a organização já decidida em vez de redescobri-la
  — e é a ausência disto que faz a escrita reabrir discussões fechadas.
- `session.yaml` recebe `focus`, `next_step` e o bloco `workflow` com
  `current_stage: confirmacao` (ou `escrita`, se o sim já veio),
  `completed_stages` acumulado e `modeling_wave: 1` ao entrar na primeira onda.
- Se a fonte de alguma recomendação foi a documentação oficial, ela vai para
  `consulted_docs` e para a seção `Fontes` da `MD-NNN`.

Nada de YAML de modelo é escrito aqui — isso é `cfour:editor`.
