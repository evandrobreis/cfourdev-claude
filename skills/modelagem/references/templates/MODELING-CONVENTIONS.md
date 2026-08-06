# Convenções desta modelagem

O que vale para quem escrever ou revisar YAML aqui. Este arquivo mora em
`model/` porque acompanha o modelo, não o plugin.

Regra de ouro: **uma convenção só entra aqui depois que uma decisão a criou**
(`$MEM/decisions/`). Convenção sem decisão vira preferência disfarçada de
regra.

## Organização

- O que é um projeto aqui (por sistema, por produto, por time — e por quê).
- O que vive em `shared/`.
- Quando criar um projeto novo em vez de uma caixa nova.

## Identificação

- Formato de `id`: minúsculas, `-` como separador, sem prefixo de projeto.
- O `id` usa o vocabulário estável; o `name` usa o vocabulário da audiência.
- Ids não são renomeados de leve: `parent`, `to`, `from`, `scope`, `target` e os
  arquivos de layout apontam para eles.

## Granularidade

- Até onde decompor, e o critério para parar.
- Onde a assimetria é deliberada (um sistema detalhado ao lado de um fechado) e
  por quê — senão o próximo leitor "corrige".

## Taxonomia ativa

Só entra aqui o que **responde a uma pergunta**. Antes de criar uma tag ou uma
chave de `meta`, responda: que pergunta ela permite responder? é acumulável
(`tag`) ou tem valor (`meta`)? vai ser usada para filtrar, agrupar ou colorir? é
estável ou temporária? já existe outra equivalente?

| chave | tipo | pergunta que responde | usada para |
|---|---|---|---|
| `owner` | meta | quem responde por isto? | filtro |
| `domain` | meta | de que domínio é? | filtro, cor, `groupBy` |
| `legado` | tag | ainda depende do legado? | filtro, `exclude` |

Chaves declaradas em `$M/model/workspace.yaml` (`label`, `color: true`) aparecem com
nome legível; as demais funcionam com a chave crua.

## Extensões declaradas

O que foi acrescentado em `$M/model/workspace.yaml` e por quê: `shapes`,
`relationKinds`, `noteKinds`, `flowOutcomes` e `metadata`.

`metadata` é o que dá nome legível a uma chave e a libera em "Colorir por"
(`color: true`). Sem ele a chave da tabela acima continua filtrando — só não
colore, e aparece com o nome cru.

## Visões

- Toda visão registra a pergunta que responde e para quem.
- Fluxo para "o que acontece", diagrama para "o que existe".
- Fluxo sem caminho triste precisa de justificativa.
