# A memória do plugin

A memória é **explícita, versionada e legível por humanos**. Nada do que importa
depende do histórico da conversa: uma sessão nova precisa conseguir retomar o
trabalho lendo arquivos.

A memória é **de uma modelagem** — mas não mora dentro dela. `$M` é a pasta do
modelo e `$MEM` a da memória (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`,
"A modelagem ativa").

```
$M/                               = o `path:` do registro  O MODELO
  modelagem.yaml                  identidade: id, name, description, status
  model/
    workspace.yaml                configuração e vocabulário DESTA modelagem
    MODELING-CONVENTIONS.md       convenções vivas: id, granularidade, taxonomia ativa
    <projeto>/**/*.yaml           OS FATOS ARQUITETURAIS

cfour.yaml                        as modelagens e qual está ativa — o ÚNICO caminho resolvido pelo cwd

.claude/cfour/history/<id>/       = $MEM                 A MEMÓRIA
    project-context.yaml          propósito, audiências, escopo, complexidade, cobertura, estratégia
    session.yaml                  onde o trabalho parou, e em que etapa
    decisions/MD-001-*.md         decisões de MODELAGEM — numeração LOCAL à modelagem
    sessions/YYYY-MM-DD-*.md      resumos estruturados do que aconteceu

.claude/cfour/docs-cache/                                A DOCUMENTAÇÃO EM CACHE
    manifest.yaml                 origem oficial, data, hash, falhas
    llms-full.txt                 o conteúdo — da PLATAFORMA, não de modelagem nenhuma
```

O `docs-cache/` fica **fora** de `history/` de propósito: ele descreve o contrato
da plataforma, que é o mesmo para todas as modelagens. Documentação dentro da
memória de uma modelagem seria N cópias divergindo entre si →
`cfour:documentacao`.

Tudo isso vai para o git. É o que permite revisar mudança de modelagem em pull
request, do mesmo jeito que se revisa código.

**A memória é ligada à modelagem pelo `id`, não pelo caminho.** Duas consequências
que ninguém deve redescobrir sozinho:

- Uma modelagem registrada fora deste repositório (`path: ~/Git/outra-coisa`)
  **tem memória mesmo assim** — local, em `.claude/cfour/history/<id>/`.
  Era exatamente o que não dava para fazer quando a memória era subpasta do
  modelo.
- Em troca, **a memória não viaja com a pasta do modelo**. Mover a pasta do
  modelo para outro repositório leva o modelo e deixa a memória para trás. Levar as
  duas é ato deliberado, e renomear o `id` renomeia a pasta da memória junto.

Duas modelagens têm, cada uma, sua série `MD-001`, seu glossário e sua régua de
qualidade. **Nada atravessa.** O `cfour.yaml` guarda o índice e, se um dia
existir, uma decisão sobre o registry em si — nunca sobre uma modelagem.

## Onde cada coisa mora

Esta divisão é a regra anti-duplicação do plugin. Escrever a mesma informação em
dois lugares garante que um deles vai mentir.

| a informação é… | mora em |
|---|---|
| um fato arquitetural (existe, chama, contém) | **o YAML do modelo** |
| um risco, dúvida ou decisão pendente **ligada a uma caixa ou visão** | **`notes:`** com `target`/`scope` (`doc:perguntas-frequentes`) |
| uma decisão sobre **como o modelo é organizado** | `$MEM/decisions/MD-NNN-*.md` |
| uma convenção a seguir daqui para frente | `$M/model/MODELING-CONVENTIONS.md` |
| propósito, audiência, escopo, hipótese, pergunta sem alvo no modelo | `$MEM/project-context.yaml` |
| o perfil de complexidade, e por que ele é esse | `$MEM/project-context.yaml` (`complexity`) |
| quais áreas técnicas foram verificadas, e o que restou | `$MEM/project-context.yaml` (`technical_coverage`) |
| a organização recomendada, validada, e o plano de ondas | `$MEM/project-context.yaml` (`strategy`) + a `MD-NNN` |
| onde o trabalho parou, em que etapa e em que onda | `$MEM/session.yaml` (`workflow`) |
| que página da documentação sustentou uma decisão | `$MEM/session.yaml` (`consulted_docs`) + `Fontes` da `MD-NNN` |
| o texto da documentação oficial | `.claude/cfour/docs-cache/` — **nunca** dentro de `history/` |
| o que aconteceu numa sessão | `$MEM/sessions/YYYY-MM-DD-*.md` |
| que realidades existem, e qual está aberta | `cfour.yaml` |

Duas consequências práticas:

- **Risco de um elemento não vai para o `project-context.yaml`.** Vai para uma
  nota, que acompanha a caixa em todo diagrama e vira filtro.
- **Decisão arquitetural ≠ decisão de modelagem.** "Vamos extrair o cálculo de
  preço" é decisão do time, e o modelo a representa; "vamos representar cada
  legado como projeto separado" é decisão de modelagem, e vira `MD-NNN`.

Usar `noteKinds: { decision: … }` exige declarar em `$M/model/workspace.yaml`
antes (`doc:configuracao`). Proponha; não assuma.

## Precedência

Duas escadas, definidas no núcleo (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`,
"Precedência das fontes"):

**o que o formato permite** — doc pública oficial → `cfour` instalado → cache
local da doc → instruções deste plugin → exemplos do projeto → sua inferência.

**a verdade sobre esta modelagem:**

1. o YAML atual do modelo (`$M/model/`)
2. decisões aceitas (`$MEM/decisions/`)
3. convenções (`$M/model/MODELING-CONVENTIONS.md`)
4. contexto consolidado (`$MEM/project-context.yaml`)
5. estado da sessão (`$MEM/session.yaml`)
6. histórico (`$MEM/sessions/`)
7. sua inferência agora

**Nunca substitua silenciosamente uma fonte de maior autoridade por uma de menor.**
Divergência entre níveis é assunto de `/cfour:reconciliar`: mostre antes de mexer.

A segunda escada é **de uma modelagem**. Memória de outra não é fonte fraca — é
fonte de outro assunto, e não entra na comparação em nível nenhum.

## Os arquivos

### `project-context.yaml`

O que uma sessão nova precisa para entender **por que** este modelo existe.
Template comentado em `templates/project-context.yaml`.

Blocos: `purpose` · `complexity` · `audiences` · `scope` · `perspectives` ·
`time` · `granularity` · `boundaries` · `technical_coverage` · `strategy` ·
`hypotheses` · `questions` · `glossary`.

Regras:

- Todo item carrega `status: fact | hypothesis | unknown`. **`unknown` explícito é
  melhor que campo ausente** — ausência não distingue "não perguntei" de "não
  importa".
- Hipótese (`H-NNN`) carrega `basis` e `refuted_by`. Sem `refuted_by` ela nunca
  morre e vira folclore.
- Pergunta (`Q-NNN`) carrega `blocks`: o que não anda enquanto ela estiver aberta.
- O `glossary` é obrigatório assim que aparecer um rótulo ou um termo que os
  participantes usam com sentidos diferentes.

### `session.yaml`

Curto e descartável. Template em `templates/session.yaml`.

Campos: `workflow` · `focus` · `last_step` · `next_step` ·
`pending_confirmations` · `touched_files` · `open_threads` · `consulted_docs` ·
`model_fingerprint`.

O `model_fingerprint` são as contagens de
`cfour check --modelagem <id> --inventory --json` (projetos, caixas, setas,
diagramas, fluxos, notas, erros, avisos) no momento em que a sessão fechou — **da
modelagem desta memória, não da árvore inteira**. Se ao retomar elas não
baterem, alguém editou o modelo fora do plugin, o que `/cfour:retomar` precisa dizer
em voz alta.

### `modelagem.yaml`

A etiqueta: `id` (igual ao do registry), `name`, `description`, `status`. Só isso.
O **porquê** mora no `project-context.yaml`, do outro lado — separar os dois é o
que permite listar as modelagens sem carregar a memória de todas. É também o
único arquivo de identidade que viaja com o modelo: é por ele que o `id` chega
ao outro repositório, e é o `id` que reencontra a memória.

### `decisions/MD-NNN-slug.md`

Uma decisão de modelagem por arquivo, numeração sequencial, nunca reaproveitada.
A sequência é **local à modelagem**: cada uma tem seu `MD-001`, e uma decisão só
governa a modelagem em que mora. Template em `templates/decision.md`.

Frontmatter: `id`, `title`, `status` (`proposed` | `accepted` | `superseded`),
`date`, `supersedes`, `affects`. Corpo: Contexto · Opções consideradas · Decisão ·
Justificativa · **O que revisaria esta decisão** · Consequências no modelo.

Decisão sem alternativa registrada é indistinguível de hábito. Decisão sem
critério de revisão nunca é revisitada.

### `sessions/YYYY-MM-DD-slug.md`

Resumo estruturado, **nunca transcrição**. Template em
`templates/session-summary.md`.

Seções: o que foi decidido · o que virou fato · hipóteses (novas / confirmadas /
refutadas) · perguntas abertas · arquivos alterados · próximo foco.

Transcrição não é memória: ninguém relê, e o que importa fica enterrado. Se um
detalhe merece sobreviver, ele pertence a um dos outros arquivos.

## Memórias de versões anteriores

`complexity`, `technical_coverage`, `strategy`, `workflow` e `consulted_docs`
**são opcionais**, e memória escrita antes deles existir continua sendo memória
válida. Não há migração a rodar, e ninguém precisa reescrever arquivo nenhum.

O contrato de leitura é **tolerante**, e tem três regras:

1. **Campo ausente é `unknown`, nunca zero e nunca erro.** Um
   `project-context.yaml` sem `technical_coverage` não significa que nada foi
   verificado — significa que a matriz não existia quando ele foi escrito.
2. **Reconstrua em vez de perguntar.** O perfil se classifica a partir do que o
   contexto já descreve; a etapa se infere pelo que existe
   (`jornada.md`, "Onde a etapa fica gravada"); a estratégia validada se lê da
   `MD-NNN` `accepted`. **Diga que inferiu**, e siga.
3. **Grave na primeira escrita.** A sessão que tocar a memória preenche os blocos
   que faltavam. Nada é perdido: os blocos antigos ficam como estão, e os novos
   nascem ao lado.

O inverso também vale: uma memória escrita hoje é legível por uma versão antiga
do plugin, que simplesmente ignora os blocos que não conhece.

## Ciclo de vida da informação

```
PERGUNTA  →  HIPÓTESE  →  FATO
   Q-NNN       H-NNN       YAML do modelo
```

- Pergunta respondida vira hipótese ou fato — e **sai** da lista de abertas.
- Hipótese confirmada vira YAML e sai do `project-context.yaml`. Deixar as duas
  coisas é criar duas verdades.
- Hipótese refutada é registrada como refutada, não apagada: saber o que foi
  descartado evita redescobrir a mesma ideia daqui a três meses.
- Decisão aceita que deixou de valer vira `superseded`, apontando a que a
  substituiu. Nunca reescreva uma decisão antiga como se ela sempre tivesse sido
  outra.
