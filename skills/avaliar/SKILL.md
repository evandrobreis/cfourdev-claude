---
name: avaliar
description: Executa a suíte de cenários que valida as próprias skills cfour — roda cada cenário num subagente, num repositório descartável, pontua pela rubrica e reporta o placar, incluindo os testes de divergência, convergência e corte de realidade entre cenários. É para quem DESENVOLVE o plugin, e não para quem o usa para modelar. Use depois de alterar qualquer skill `cfour:*`, ou quando pedirem para testar/avaliar o plugin.
---

# Avaliação do plugin

Esta skill é ferramenta de quem **desenvolve** o `cfour`. Se você chegou aqui
querendo modelar alguma coisa, o caminho é `cfour:modelagem`.

Os cenários são **testes, não regras**. Nada do que está em `scenarios/` pode
virar comportamento do núcleo: se um cenário só passa com uma regra específica
dele, o problema é a regra, não o cenário.

## O que existe

- `rubric.md` — os treze critérios comuns e os três testes transversais.
- `scenarios/01..11-*.md` — briefing, respostas preparadas, armadilhas e critérios
  específicos de cada caso.

## Como rodar

**Peça confirmação antes.** Rodar os onze cenários gasta bastante — pergunte
quantos e quais, e ofereça o subconjunto mínimo útil: `01`, `03`, `04`, `09`,
`10`, `11` (que cobrem os três testes transversais).

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

Para cada cenário selecionado, um subagente, com este contrato:

> Você vai interpretar **dois papéis, separadamente**.
>
> **Papel 1 — o arquiteto.** Você recebe `scenarios/NN-*.md`. Abra a conversa com
> o briefing, literalmente. Depois responda **apenas ao que for perguntado**,
> usando a tabela de respostas preparadas. Pergunta fora da tabela: responda de
> forma plausível e mantenha coerência. **Nunca ofereça informação que não foi
> pedida** e nunca sugira estrutura.
>
> **Papel 2 — o avaliador.** Ao final, pontue a conversa pela `rubric.md` e pelos
> critérios específicos do cenário. Cada critério: `PASSA` / `FALHA` / `PARCIAL`,
> **sempre com a citação** da fala do harness que comprova.
>
> O harness sob teste é o conjunto de skills `cfour:*` do plugin instalado.
> Siga-as como o Claude as seguiria. Trabalhe no diretório que lhe foi dado, e
> em nenhum outro.

Os cenários são independentes: rode-os em paralelo, cada um na sua modelagem.

## Depois das execuções

### Os três testes transversais

Nenhum cenário sozinho detecta isto:

- **Divergência (01 × 09)** — vocabulário quase idêntico ("plataforma",
  "componentizar"), necessidades opostas. As estratégias saíram **diferentes**?
  Saíram por escala, ownership, audiência e coexistência — ou por rótulo?
- **Convergência (03 × 10)** — rótulos diferentes, necessidades comunicacionais
  parecidas. As estratégias **convergiram** para ownership explícito e fluxo sobre
  estrutura existente?
- **Corte de realidade (04 × 11)** — nos dois há duas organizações. A separação em
  modelagens saiu do que precisa aparecer junto, ou saiu do CNPJ? Um harness que
  responde "empresas diferentes → modelagens diferentes" acerta o 11 por acaso e
  erra o 04.

Se a estratégia acompanhou o rótulo em vez das necessidades, o harness falhou —
mesmo com todos os treze critérios passando em cada cenário isolado.

### O placar

```
cenário            eliminatórios   demais        veredito
01 aplicação nova  1✓ 2✓ 5✓         10✓ 2~        PASSA
09 componentização 1✓ 2✗ 5✓         ...           REPROVA — assumiu strangler antes de perguntar
11 duas frentes    1✓ 2✓ 5✓         ...           REPROVA — separou por empresa, sem perguntar o que atravessa
...
divergência 01×09  ...
convergência 03×10 ...
corte 04×11        ...
```

Um cenário passa com nenhum `FALHA` e no máximo dois `PARCIAL`. Critérios 1, 2 e
5 são eliminatórios.

### O que fazer com uma falha

Falha aponta para **uma skill**, não para um cenário:

| falhou | olhe |
|---|---|
| 1, 2 (propósito, não assumir) | `cfour:descoberta`, `labels-are-not-strategies.md` |
| 3, 6 (perguntas, estados) | `cfour:entrevista` |
| 4, 5, 8 (alternativa, justificativa, visões) | `cfour:estrategia`, `view-or-flow.md` |
| 7, 12 (mapa/história, finais tristes) | `view-or-flow.md` |
| 9, 10 (YAML, contrato) | `cfour:editor`, `viewer-contract.md` |
| 11 (memória) | `cfour:encerrar`, `memory-model.md` |
| 13 (modelagem ou projeto) | `modelagem-ou-projeto.md`, `cfour:modelagens`, passo 0 de `cfour:descoberta` |

Corrija a skill e rode **de novo o cenário que falhou**, mais os dois
transversais — uma correção que resolve um caso costuma quebrar outro.

**Nunca corrija adicionando ao núcleo uma regra sobre o cenário.** "Quando for
componentização, faça X" é exatamente o que o harness existe para não fazer.
