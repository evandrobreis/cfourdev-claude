---
name: reconciliar
description: Reconcilia a memória do plugin com o modelo do cfourdev — encontra convenções não seguidas, decisões desatualizadas, hipóteses já resolvidas, termos e metadados equivalentes, e referências a elementos removidos ou renomeados. Use quando memória e modelo parecerem divergir, depois de alguém editar YAML fora do plugin, antes de uma revisão importante, ou quando pedirem /cfour:reconciliar.
---

# Reconciliar memória e modelo

Modelo e memória envelhecem em ritmos diferentes. Esta skill encontra onde eles
já não dizem a mesma coisa.

> **Apresente todas as divergências antes de alterar qualquer coisa.** Nenhuma
> correção automática, nem "as óbvias". O que parece óbvio para quem lê o arquivo
> costuma ser a parte que alguém decidiu de propósito.

## 1. Levantar o estado

Reconciliação é **de uma modelagem por vez**. Resolva qual (núcleo, "A modelagem
ativa"; com mais de uma registrada, pergunte) e anuncie antes de qualquer coisa.

Duas modelagens que dizem coisas diferentes **não estão divergindo** — são
assuntos diferentes. Cruzar as duas produz uma lista de falsos positivos que
ensina o arquiteto a ignorar esta skill.

```bash
cfour check --modelagem <id> --inventory --json
```

Mais: `$MEM/project-context.yaml`, `$MEM/session.yaml`,
`$MEM/decisions/*.md`, `$MEM/sessions/*.md`,
`$M/model/MODELING-CONVENTIONS.md`.

## 2. Procurar as onze divergências

| # | procurar | como se reconhece |
|---|---|---|
| 1 | **convenção não seguida** | id fora do formato declarado, caixa fora do projeto que a convenção previa, visão sem a pergunta registrada |
| 2 | **decisão desatualizada** | decisão `accepted` cuja consequência não existe no modelo — ou cujo contrário existe |
| 3 | **hipótese já resolvida** | `H-NNN` `open` que o YAML confirma ou contradiz |
| 4 | **pergunta já respondida** | `Q-NNN` `open` cuja resposta está no modelo, numa nota ou num resumo |
| 5 | **termos diferentes para o mesmo conceito** | duas caixas com nomes distintos e a mesma descrição; glossário divergindo do `name` |
| 6 | **metadados equivalentes** | `owner` e `time`; `domain` e `dominio`; valores com grafias diferentes (`Vendas` × `vendas`) |
| 7 | **sessão × YAML** | `model_fingerprint` diferente das contagens atuais; `pending_confirmations` que viraram arquivo |
| 8 | **referência morta** | decisão, resumo ou contexto citando id que não existe mais |
| 9 | **fluxo apontando para integração que sumiu** | passos `!` no inventário — a estrutura mudou e a história não |
| 10 | **registry × disco** | entrada apontando para pasta que não existe; `active` nomeando um id que não está na lista; `modelagem.yaml` com `id` diferente do registrado |
| 11 | **modelagem fora do registry** | pasta com `model/` e `modelagem.yaml` que ninguém registrou — invisível para o viewer e para toda skill |

Use o `facets` do inventário para o item 6: chaves e valores próximos aparecem
lado a lado ali, com a contagem de cada um.

Os itens 10 e 11 são os únicos que olham **acima** da modelagem. Rode-os uma vez
por reconciliação, não uma vez por modelagem — e ao encontrar 11, ofereça
`cfour:modelagens` para registrar, nunca registre por conta própria: uma pasta fora
do registry pode ser rascunho deliberado.

## 3. Apresentar

Uma linha por divergência, agrupadas por gravidade:

```
BLOQUEIA        impede continuar a modelar
CONTRADIZ       memória e modelo afirmam coisas diferentes
DESATUALIZADO   a memória ficou para trás, sem contradizer
COSMÉTICO       grafia, sinônimo, ordenação
```

Para cada uma:

```
o que diverge
  memória diz: ...
  modelo diz: ...
  hipótese do que aconteceu: ...
  correções possíveis: (a) ... (b) ...
```

**Ofereça as duas direções da correção.** Uma divergência pode significar que o
modelo está errado *ou* que a memória envelheceu — e quem sabe qual é o arquiteto.

## 4. Aplicar só o aprovado

Depois da decisão dele:

- ajuste o que foi aprovado (modelo via `cfour:editor`, memória direto);
- decisão que deixou de valer vira `superseded`, nunca reescrita;
- divergência que ele decidiu manter vira uma linha explícita em
  `$M/model/MODELING-CONVENTIONS.md` ou uma nota — senão a próxima reconciliação
  a encontra de novo, e a lista vira ruído que ninguém lê;
- rode `cfour check --modelagem <id>` e relate.

## Sinal de alarme

Se a maior parte das divergências for do tipo 7 (`fingerprint` diferente), o
modelo vem sendo editado fora do plugin. Isso é legítimo — o YAML é do
arquiteto, não do plugin. Diga em voz alta o que isso implica: a memória descreve
uma modelagem que já não é a atual, e vale reconciliar antes de continuar a
escrever por cima.
