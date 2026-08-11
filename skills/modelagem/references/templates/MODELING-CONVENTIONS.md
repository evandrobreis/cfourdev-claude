# Convenções desta modelagem

O que vale para quem escrever ou revisar YAML aqui. Este arquivo mora em
`model/` porque acompanha o modelo, não o plugin.

**Regra de ouro: só entra aqui o que o arquiteto declarou.** Convenção que
ninguém decidiu é preferência disfarçada de regra — e, num plugin que não decide
modelagem, ela não teria de onde vir.

Um arquivo que só repete o padrão do formato não é convenção registrada: é ruído
com nome de contrato. Se não houver convenção própria, este arquivo não precisa
existir.

## Organização

- o que é um projeto aqui, e por quê;
- o que vive em `shared/`.

## Identificação

- formato de `id` (o padrão é minúsculas com `-`), e o que o `name` carrega;
- ids não são renomeados de leve: `parent`, `to`, `from`, `scope`, `target` e os
  arquivos de layout apontam para eles. `cfour element mv` conserta as
  referências desta modelagem — não as de outra que aponte para cá por `bind`.

## Taxonomia

As chaves de `tags` e `meta` que o arquiteto adotou, e a pergunta que cada uma
responde:

| chave | tipo | responde | usada para |
|---|---|---|---|
| `owner` | meta | quem responde por isto? | filtro |
| `domain` | meta | de que domínio é? | filtro, cor, `groupBy` |

Chave de `meta` filtra sozinha. Para ela **colorir**, precisa de `color: true`
declarado — `cfour config set metadata <chave> --label … --color …`.

## Extensões declaradas

O que foi acrescentado em `$M/model/workspace.yaml` e por quê: `shapes`,
`relationKinds`, `noteKinds`, `flowOutcomes`, `metadata`.
