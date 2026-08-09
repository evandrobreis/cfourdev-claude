---
name: avaliar
description: Executa a suíte de cenários que valida as próprias skills cfour — roda cada cenário num subagente, num repositório descartável, pontua pela rubrica e reporta o placar, incluindo os testes de divergência, convergência e corte de realidade entre cenários. É para quem DESENVOLVE o plugin, e não para quem o usa para modelar. Use depois de alterar qualquer skill `cfour:*`, ou quando pedirem para testar/avaliar o plugin.
---

# Avaliação do plugin

Esta skill é ferramenta de quem **desenvolve** o `cfour`. Se você chegou aqui
querendo modelar alguma coisa, o caminho é `cfour:modelagem`.

Os cenários são **testes, não regras**. Nada do que está em `${CLAUDE_PLUGIN_ROOT}/skills/avaliar/scenarios/` pode
virar comportamento do núcleo: se um cenário só passa com uma regra específica
dele, o problema é a regra, não o cenário.

## O que existe

- `${CLAUDE_PLUGIN_ROOT}/skills/avaliar/rubric.md` — os dezenove critérios comuns e os
  testes transversais.
- `${CLAUDE_PLUGIN_ROOT}/skills/avaliar/scenarios/NN-*.md` — briefing, respostas
  preparadas, armadilhas e critérios específicos de cada caso. Alguns trazem uma
  seção **`## Preparação`**: o que precisa existir no repositório descartável
  **antes** de o subagente abrir a conversa — um arquivo plantado, uma memória
  pela metade, um cache com data velha. Sem isso o cenário testa outra coisa.

Os cenários `01`–`11` medem o método: propósito, agnosticismo de rótulo,
alternativas, contrato. Os `12`–`22` medem o **processo**: proporcionalidade,
jornada, recomendação, cobertura técnica, classificação, documentação e retomada.

## Como rodar

**Peça confirmação antes.** Rodar os vinte e dois cenários gasta bastante —
pergunte quantos e quais, e ofereça o subconjunto mínimo útil: `01`, `03`, `04`,
`09`, `10`, `11`, `12`, `13`, `14`, `16`, `20` — que cobrem os quatro testes
transversais, os dois extremos de calibragem e as duas falhas eliminatórias mais
caras.

### Cada cenário roda num repositório descartável

**Nada disto acontece no repositório do arquiteto.** Antes de despachar os
subagentes, crie **um diretório temporário por cenário**, fora de qualquer
repositório de verdade, e dentro dele um repositório de avaliação completo:

```
<tmp>/eval-NN-<slug>/
  cfour.yaml                     registro próprio, com uma modelagem só
  <slug>/                        o modelo, pelo esqueleto de `cfour:modelagens`
  .claude/cfour/history/<slug>/  a memória
```

Cada subagente recebe o caminho do **seu** diretório e trabalha lá dentro, com o
`cwd` nele — é assim que `cfour check` acha o registro certo.

Dois motivos, e nenhum é higiene: com um registro só, N subagentes em paralelo
não disputam o mesmo `cfour.yaml`, e a limpeza vira `rm -rf` de um diretório em
vez de desfazer edições num arquivo de outra pessoa. A versão antiga desta skill
criava as modelagens dentro do repositório sob teste e mandava "apagar ao final",
em prosa — o registro do repositório vira lixo de teste na primeira rodada que
falhar no meio.

Apague os diretórios ao final e confira que apagou. São resultado de teste, não
memória.

**A `## Preparação` do cenário vence este esqueleto**, inclusive quando o que ela
pede é a **ausência** de um arquivo: há cenário que só testa o que testa num
repositório sem `cfour.yaml` nenhum, e montar o registro por hábito faz o
subagente pular justamente o caminho sob teste. Cenário com **partes** (`Parte
A`, `Parte B`) é o mesmo: um diretório e um subagente **por parte**, conversas
separadas, e o veredito do cenário reprova se qualquer parte reprovar.

Para cada cenário selecionado, um subagente, com este contrato:

> Você vai interpretar **dois papéis, separadamente**.
>
> **Papel 1 — o arquiteto.** Você recebe o caminho absoluto de
> `${CLAUDE_PLUGIN_ROOT}/skills/avaliar/scenarios/NN-*.md`. O caminho tem de ser
> absoluto: o seu `cwd` é o diretório descartável do cenário, e um caminho
> relativo não resolve de lá. Se o arquivo tiver partes, você recebe **o nome da
> sua**, e o briefing, a tabela e os critérios que valem são os dela. Abra a
> conversa com o briefing, literalmente. Depois responda **apenas ao que for
> perguntado**,
> usando a tabela de respostas preparadas. Pergunta fora da tabela: responda de
> forma plausível e mantenha coerência. **Nunca ofereça informação que não foi
> pedida** e nunca sugira estrutura.
>
> **Papel 2 — o avaliador.** Ao final, pontue a conversa pela
> `${CLAUDE_PLUGIN_ROOT}/skills/avaliar/rubric.md` e pelos
> critérios específicos do cenário. Cada critério: `PASSA` / `FALHA` / `PARCIAL`,
> **sempre com a citação** da fala do plugin que comprova.
>
> O que está sob teste é o conjunto de skills `cfour:*` do plugin instalado.
> Siga-as como o Claude as seguiria. Trabalhe no diretório que lhe foi dado, e
> em nenhum outro.

Os cenários são independentes: rode-os em paralelo, cada um na sua modelagem.

## Depois das execuções

### Os quatro testes transversais

Nenhum cenário sozinho detecta isto:

- **Divergência (01 × 09)** — vocabulário quase idêntico ("plataforma",
  "componentizar"), necessidades opostas. As estratégias saíram **diferentes**?
  Saíram por escala, ownership, audiência e coexistência — ou por rótulo?
- **Convergência (03 × 10)** — rótulos diferentes, necessidades comunicacionais
  parecidas. As estratégias **convergiram** para ownership explícito e fluxo sobre
  estrutura existente?
- **Corte de realidade (04 × 11)** — nos dois há duas organizações. A separação em
  modelagens saiu do que precisa aparecer junto, ou saiu do CNPJ? Um plugin que
  responde "empresas diferentes → modelagens diferentes" acerta o 11 por acaso e
  erra o 04.
- **Calibragem (01 × 13, e 12 × 21)** — dois cenários chamados "plataforma"
  receberam perfis **diferentes** (01 leve, 13 profundo)? E dois que **começam**
  parecidos terminaram diferentes, porque um cresceu (12 leve, 21 recalibrado)?
  Perfil que acompanha o vocabulário do briefing, ou que nunca se revisa, é o
  mesmo defeito da estratégia que segue rótulo.

Se a estratégia — ou o peso do processo — acompanhou o rótulo em vez das
necessidades, o plugin falhou, mesmo com todos os dezenove critérios passando em
cada cenário isolado.

### O placar

```
cenário            eliminatórios      demais        veredito
01 aplicação nova  1✓ 2✓ 5✓ 16✓        10✓ 2~        PASSA
09 componentização 1✓ 2✗ 5✓ 16✓        ...           REPROVA — assumiu strangler antes de perguntar
11 duas frentes    1✓ 2✓ 5✓ 16✓        ...           REPROVA — separou por empresa, sem perguntar o que atravessa
14 decide você     1✓ 2✓ 5✓ 16✗        ...           REPROVA — ofereceu duas opções e não recomendou nenhuma
...
divergência 01×09  ...
convergência 03×10 ...
corte 04×11        ...
calibragem 01×13   ...
```

Um cenário passa com nenhum `FALHA` e no máximo dois `PARCIAL`. Critérios 1, 2,
5 e 16 são eliminatórios.

### O que fazer com uma falha

Falha aponta para **uma skill**, não para um cenário:

| falhou | olhe |
|---|---|
| 1, 2 (propósito, não assumir) | `cfour:descoberta`, `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/labels-are-not-strategies.md` |
| 3, 6 (perguntas, estados) | `cfour:entrevista` |
| 4, 5, 8 (alternativa, justificativa, visões) | `cfour:estrategia`, `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/view-or-flow.md` |
| 7, 12 (mapa/história, finais tristes) | `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/view-or-flow.md` |
| 9, 10 (YAML, contrato) | `cfour:editor`, `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/viewer-contract.md` |
| 11 (memória) | `cfour:encerrar`, `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/memory-model.md` |
| 13 (modelagem ou projeto) | `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md`, `cfour:modelagens`, passo 0 de `cfour:descoberta` |
| 14 (proporcional) | `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/calibragem.md`, e a seção de calibragem de `cfour:descoberta` |
| 15 (jornada) | `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/jornada.md`, `cfour:retomar` |
| 16 (recomenda) | `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/decisoes-de-quem.md`, guarda-corpo 4, `cfour:setup`, `cfour:estrategia` |
| 17 (cobertura técnica) | `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/cobertura-tecnica.md`, `cfour:entrevista` |
| 18 (documentação) | `cfour:documentacao`, `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/viewer-contract.md` |

Corrija a skill e rode **de novo o cenário que falhou**, mais os dois
transversais — uma correção que resolve um caso costuma quebrar outro.

**Nunca corrija adicionando ao núcleo uma regra sobre o cenário.** "Quando for
componentização, faça X" é exatamente o que o plugin existe para não fazer.
