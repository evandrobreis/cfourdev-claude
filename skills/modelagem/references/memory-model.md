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
    project-context.yaml          propósito, audiências, escopo, hipóteses, perguntas, glossário
    session.yaml                  onde o trabalho parou
    decisions/MD-001-*.md         decisões de MODELAGEM — numeração LOCAL à modelagem
    sessions/YYYY-MM-DD-*.md      resumos estruturados do que aconteceu
```

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
| onde o trabalho parou, o que falta confirmar | `$MEM/session.yaml` |
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

1. a documentação do cfourdev (`https://cfourdev.com.br/docs/`) e o contrato em
   `viewer-contract.md`, que a resume
2. o YAML atual do modelo (`$M/model/`)
3. decisões aceitas (`$MEM/decisions/`)
4. convenções (`$M/model/MODELING-CONVENTIONS.md`)
5. contexto consolidado (`$MEM/project-context.yaml`)
6. estado da sessão (`$MEM/session.yaml`)
7. histórico (`$MEM/sessions/`)
8. sua inferência agora

**Nunca substitua silenciosamente uma fonte de maior autoridade por uma de menor.**
Divergência entre níveis é assunto de `/cfour:reconciliar`: mostre antes de mexer.

Do 2 ao 7, a escada é **de uma modelagem**. Memória de outra não é fonte fraca —
é fonte de outro assunto, e não entra na comparação em nível nenhum.

## Os arquivos

### `project-context.yaml`

O que uma sessão nova precisa para entender **por que** este modelo existe.
Template comentado em `templates/project-context.yaml`.

Blocos: `purpose` · `audiences` · `scope` · `perspectives` · `time` ·
`granularity` · `boundaries` · `hypotheses` · `questions` · `glossary`.

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

Campos: `focus` · `last_step` · `next_step` · `pending_confirmations` ·
`touched_files` · `open_threads` · `model_fingerprint`.

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
