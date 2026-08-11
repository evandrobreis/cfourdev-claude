# A memória do plugin

A memória é **explícita, versionada e legível por humanos**. Nada do que importa
depende do histórico da conversa: uma sessão nova precisa conseguir retomar o
trabalho lendo arquivos.

Ela guarda **fatos e decisões do arquiteto** — não o raciocínio do agente. Não há
estratégia recomendada, alternativas consideradas, trade-offs, perfil de processo
nem plano de ondas: nada disso existe mais no plugin, e portanto nada disso se
grava.

A memória é **de uma modelagem**, mas não mora dentro dela. `$M` é a pasta do
modelo e `$MEM` a da memória (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`,
"A modelagem ativa").

```
$M/                               = o `path:` do registro  O MODELO
  modelagem.yaml                  identidade: id, name, description, status
  model/
    workspace.yaml                configuração e vocabulário DESTA modelagem
    MODELING-CONVENTIONS.md       convenções que o ARQUITETO declarou
    <projeto>/**/*.yaml           OS FATOS ARQUITETURAIS

cfour.yaml                        as modelagens e qual está ativa — o ÚNICO caminho resolvido pelo cwd

.claude/cfour/history/<id>/       = $MEM                 A MEMÓRIA
    project-context.yaml          o que se sabe do software e da documentação
    session.yaml                  onde o trabalho parou
    decisions/MD-001-*.md         decisões informadas pelo arquiteto — numeração LOCAL
    sessions/AAAA-MM-DD-*.md      resumos estruturados

.claude/cfour/cli-cache/                                 AS CAPACIDADES DA CLI
    manifest.yaml                 versão do `cfour` e quando foi gerado
    help.json                     `cfour help --output json`, como veio
```

O `cli-cache/` fica **fora** de `history/` de propósito: ele descreve a
ferramenta, que é a mesma para todas as modelagens → `cfour:cli`.

Tudo isso vai para o git. É o que permite revisar mudança de modelagem em pull
request, do mesmo jeito que se revisa código.

**A memória é ligada à modelagem pelo `id`, não pelo caminho.** Uma modelagem
registrada fora deste repositório tem memória mesmo assim, local; em troca, a
memória não viaja com a pasta do modelo. Duas modelagens têm, cada uma, sua série
`MD-001` e seu glossário. **Nada atravessa.**

## Onde cada coisa mora

Esta divisão é a regra anti-duplicação do plugin. A mesma informação em dois
lugares garante que um deles vai mentir.

| a informação é… | mora em |
|---|---|
| um fato arquitetural (existe, chama, contém) | **o YAML do modelo** |
| um risco, dúvida ou pendência **ligada a uma caixa ou visão** | **`notes:`**, com `target`/`scope` |
| o objetivo da documentação, a audiência, o escopo, a terminologia | `$MEM/project-context.yaml` |
| o que se sabe do software e ainda não virou modelo | `$MEM/project-context.yaml` |
| uma dúvida aberta sem alvo no modelo | `$MEM/project-context.yaml` (`questions`) |
| uma decisão que o arquiteto tomou e informou | `$MEM/decisions/MD-NNN-*.md` |
| uma convenção que ele declarou | `$M/model/MODELING-CONVENTIONS.md` |
| a última operação, o foco e o próximo passo | `$MEM/session.yaml` |
| o que aconteceu numa sessão | `$MEM/sessions/AAAA-MM-DD-*.md` |
| que realidades existem, e qual está aberta | `cfour.yaml` |
| o que a CLI instalada sabe fazer | `.claude/cfour/cli-cache/` |

Duas consequências práticas:

- **Risco de um elemento não vai para o `project-context.yaml`.** Vai para uma
  nota, que acompanha a caixa em todo diagrama e vira filtro no viewer.
- **Decisão do arquiteto ≠ inferência sua.** Só entra em `decisions/` o que ele
  decidiu e disse. Se você precisou perguntar e ele respondeu, isso é decisão
  dele — registre com as palavras dele. Se ninguém decidiu, é `questions`.

## Os arquivos

### `project-context.yaml`

O que uma sessão nova precisa para interpretar corretamente os pedidos do
arquiteto. Template comentado em `templates/project-context.yaml`.

Blocos: `objetivo` · `audiences` · `scope` · `sistema` · `tecnologias` ·
`elementos_conhecidos` · `fontes` · `glossary` · `questions`.

Regras:

- todo item carrega `status: fact | evidence | unknown`. **`fact`** é o que o
  arquiteto afirmou; **`evidence`** é o que você leu no repositório e ele ainda
  não confirmou; **`unknown`** é dívida declarada;
- grave o que a conversa **tocou**. Campo que ninguém conversou fica ausente —
  encher o arquivo de `unknown` produz um documento que parece completo e não é;
- o `glossary` nasce assim que um termo aparecer com mais de um sentido.

### `session.yaml`

Curto e descartável. Template em `templates/session.yaml`.

Campos: `focus` · `last_operation` · `next_step` · `pending` · `touched_files` ·
`model_fingerprint`.

`last_operation` é o comando que rodou e o que ele fez — é o que permite retomar
sem reconstruir a conversa. O `model_fingerprint` são as contagens de
`cfour check --modelagem <id> --inventory --json` quando a sessão fechou; se ao
retomar elas não baterem, alguém editou o modelo fora do plugin, e isso se diz em
voz alta.

### `decisions/MD-NNN-slug.md`

Uma decisão por arquivo, numeração sequencial local à modelagem. Template em
`templates/decision.md`. Registra **o que o arquiteto decidiu**, quando, com as
palavras dele, e o que aquilo governa daqui para frente.

### `sessions/AAAA-MM-DD-slug.md`

Resumo estruturado, **nunca transcrição**. Template em
`templates/session-summary.md`.

## Memórias escritas por versões anteriores do plugin

Elas existem, e continuam sendo memória válida. Não há migração a rodar.

**O contrato de leitura é tolerante, e tem um limite:**

1. **Aproveite o que é fato.** `purpose`, `audiences`, `scope`, `glossary`,
   `questions`, `hypotheses` e as notas de `technical_coverage` descrevem o
   software e o objetivo da documentação: leia, e traga para os blocos de hoje.
2. **Ignore o que era raciocínio do agente.** `strategy` (estrutura recomendada,
   alternativas, `waves`), `complexity` (perfil `leve`/`intermediario`/`profundo`),
   `workflow` (as etapas e a onda), `classification.keys` e
   `classification.rejected` e `consulted_docs` são **história do que já se
   conversou, nunca instrução**. Eles **não pautam** o que fazer agora, não
   reabrem discussão e não viram recomendação.
3. **Não reescreva nem apague em silêncio.** Se o arquiteto quiser limpar,
   ofereça; enquanto isso, esses blocos ficam onde estão.
4. **Campo ausente é `unknown`**, nunca zero e nunca erro.

Um `.claude/cfour/docs-cache/` encontrado é cache de uma fonte que saiu de uso: o
plugin não consulta mais documentação na rede. Relate que ele está ali e ofereça
remover; não o leia como fonte.

## Ciclo de vida da informação

```
DÚVIDA      →  FATO CONFIRMADO  →  MODELO
questions      project-context      YAML, pela CLI
```

- dúvida respondida sai da lista de abertas;
- fato que virou modelo **sai** do `project-context.yaml` — deixar nos dois
  lugares é criar duas verdades;
- evidência lida no repositório só vira fato quando o arquiteto confirma.
