---
name: editor
description: Escreve e altera os YAMLs do modelo do cfourdev — elementos, relações, notas, diagramas e fluxos — respeitando o contrato do viewer, reaproveitando ids, evitando duplicidade e validando com cfour check. Use sempre que uma informação arquitetural confirmada precisar virar arquivo no model/ de uma modelagem, ou ao corrigir, mover ou remover algo que já está lá.
---

# Editor do modelo

Converte conhecimento **confirmado** em YAML compatível com o viewer. Não é um
tradutor de frases: nem tudo que foi dito na conversa pertence ao modelo.

Leia `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/viewer-contract.md` antes de escrever.

Resolva a modelagem antes do primeiro arquivo (núcleo, "A modelagem ativa") e
anuncie qual é. **Uma alteração nunca toca duas modelagens.** Se o que foi
confirmado parece pertencer a duas, ele pertence a nenhuma ainda: leve o caso
para `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md` antes de escrever qualquer coisa.

## Passo 1 — classificar antes de escrever

Para cada informação, decida o que ela é. Escrever antes de classificar é como
nasce modelo inflado:

| a informação é | vai para |
|---|---|
| uma coisa que existe e tem fronteira | **elemento** |
| uma ligação entre duas coisas | **relação** |
| um risco, dúvida, bloqueio, decisão sobre uma caixa | **nota** |
| uma classificação com valor | **`meta`** |
| um sinalizador acumulável | **`tag`** |
| uma visão estrutural | **diagrama** |
| um caso de uso em ordem | **fluxo** |
| algo que você inferiu e ninguém confirmou | `$MEM/project-context.yaml` (`H-NNN`), **não o modelo** |
| contexto da conversa | lugar nenhum |

Na dúvida entre elemento e detalhe: se ninguém vai apontar uma seta para aquilo,
nem abrir aquilo por dentro, provavelmente é `description` de outra caixa.

## Passo 2 — escrever

### Regras que valem sempre

- **Preserve ids.** Renomear id quebra `parent`, `to`, `from`, `scope`, `target` e
  os arquivos de `.layout/`. Se for mesmo necessário, atualize todas as
  referências na mesma alteração e avise.
- **Reutilize.** Procure antes de criar: `cfour check --modelagem <id> --inventory --json`
  lista tudo que existe. Caixa duplicada com nome diferente é o erro mais caro.
- **Uma seta, uma vez, no nível mais fino que se conhece.** O viewer sobe as
  pontas sozinho. Não escreva a mesma integração em três níveis.
- **Co-loque a seta na caixa de origem.** Arquivo separado só quando a origem
  mora em `shared/` ou quando a seta liga dois projetos sem dono claro.
- **Nunca aponte uma seta para outra MODELAGEM.** `to: outra/coisa` resolve dentro
  desta árvore ou vira erro — não existe id de outra modelagem aqui. Para um
  ponto de contato real, escreva uma caixa `external` local com
  `bind: { modelagem, ref }` (o `ref` sempre qualificado, `<projeto>/<id>`) e
  aponte a seta para o id LOCAL. Lida sozinha é uma caixa comum; lidas juntas, o
  espelho se dissolve no elemento real. Espelho não tem filhos, e é declaração
  manual: se estiver escrevendo o terceiro para o mesmo vizinho, pare e leve a
  pergunta de estrutura ao arquiteto.
- **Respeite a hierarquia.** Nível vem de `parent`; nunca escreva `level:` para
  "consertar" um desenho.
- **Preserve comentários e a ordem dos campos** dos arquivos existentes. O viewer
  nunca reescreve o modelo — o único que pode estragar a legibilidade é você.
- **Alterações pequenas.** Um assunto por vez, para o diff ser revisável em PR.
- **Declare antes de usar.** `shape`, `kind` de relação ou nota, `outcome` de
  fluxo que não existam ainda precisam entrar em `$M/model/workspace.yaml` primeiro
  — proponha ao arquiteto, não decida sozinho.

### Elemento

`id` é o único obrigatório. Prefira `name` no vocabulário da audiência,
`technology` fora do `name`, `description` em uma frase do que a caixa faz.
`shape` é só desenho: escolha o que ajuda o leitor a reconhecer de longe.

### Relação

`kind` conta o tipo de conversa (`sync`, `async`, `event`, `batch`, `dep`,
`peer`); `label` é curto — ele não é desenhado no diagrama, aparece no hover.

### Nota

`kind: risk | question | blocker | warning | info | tip`. Com `target` ela
acompanha a caixa em toda visão; com `scope` fica presa a uma; sem os dois é
descartada com aviso. **Dúvida e risco vão para cá** — não para um comentário
YAML, que ninguém lê no viewer.

### Diagrama

Prefira o critério à lista: `scope` já traz os filhos; `include` com seletor
sobrevive a caixas novas; listar caixa por caixa só compensa em visão de topo
curada. Registre a pergunta que a visão responde (nota `info` no diagrama).

### Fluxo

Cinco regras específicas, todas de `docs/05`:

1. **Um fluxo não cria caixa nenhuma.** Se a história precisa de algo que não
   existe, primeiro decida o elemento — depois escreva o passo.
2. **Todo passo deveria ser uma seta declarada.** As três exceções legítimas:
   resposta pela mesma ligação, chamada interna (`from` = `to`), e entrega para
   dentro de si (uma ponta dentro da outra). Fora disso, o passo sai marcado com
   `!` e a carga avisa — resolva a causa, não o sintoma.
3. **`id` de fluxo não pode colidir com `id` de diagrama** do mesmo projeto.
4. **Escreva no nível mais fino que os passos realmente conhecem.** A projeção
   por nível cuida do resto.
5. **Um fluxo com erro não carrega inteiro.** Rodar o check depois de mexer em
   fluxo não é opcional.

## Passo 3 — validar e relatar

```bash
cfour check --modelagem <id>
```

Sempre. E relate o que ele disse **de verdade** — inclusive quando reprova.
Erro novo introduzido por você se conserta antes de seguir; aviso preexistente se
menciona, não se esconde.

Se o viewer estiver aberto (`cfour serve`), salvar o arquivo já recarrega a tela:
vale pedir ao arquiteto para olhar o desenho. O risco real de modelo gerado por
IA é o desenho **plausível e errado**, e isso só a leitura humana pega.

## O que nunca fazer

- Escrever no modelo o que ainda é hipótese.
- Criar uma caixa para representar um conceito que ninguém vai referenciar.
- Duplicar uma seta em vários níveis "para ficar completo".
- Criar `tag` ou chave de `meta` sem a pergunta que ela responde.
- Apagar um aviso mudando o desenho em vez da causa.
- Reescrever um arquivo inteiro para mudar duas linhas.
- Criar um espelho (`bind`) para um vizinho que ninguém pediu, ou para "deixar
  pronto": ele é uma amarra que envelhece com o modelo de outra pessoa.
