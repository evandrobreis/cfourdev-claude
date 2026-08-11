# O formato do C4Dev — resumo para ler o modelo

**Este arquivo é resumo, e não é a fonte.** A autoridade sobre o formato é a CLI
instalada, nesta ordem: o que o `cfour check` aceita, depois `cfour help formato`,
depois `cfour config show` (que lista os `shape`, os `kind` de seta e de nota e os
`outcome` válidos **nesta** modelagem, incluindo os que ela mesma acrescentou).

Ele existe para você **ler** um modelo sem precisar rodar um comando a cada
campo, e para reconhecer o que existe quando estiver conferindo. Para **escrever**,
o caminho é o comando (`cfour:operar`), e o comando conhece os campos.

**Regra que não muda: não invente campo, `shape`, `kind`, `outcome` ou
comportamento.** Campo inventado **não falha** — ele é ignorado em silêncio, e o
desenho fica sem a coisa que você achou que tinha escrito.

## 1. Onde os arquivos ficam

- O carregador lê **uma raiz de modelagem por vez**: o `model/` de uma modelagem.
- Uma pasta diretamente sob `model/` **é** um projeto; o nome da pasta é o id.
- Todo o resto é arranjo livre: o carregador lê **todos** os `.yaml` do projeto e
  descobre o conteúdo pelo documento, não pelo caminho.
- Exceções da leitura: `workspace.yaml` e pastas que começam com ponto (`.layout/`).
- Arquivo solto na raiz, fora de projeto: ignorado com aviso.
- Ids são locais ao projeto e viram `projeto/id` internamente. Válidos: letras,
  números, `.`, `-`, `_`. A barra é reservada.
- Um arquivo pode ter vários documentos separados por `---`.
- Não existe índice, lista mestra nem registro a manter.

**Resolução de referência** (`parent`, `to`, `from`, `ref`, `scope`, `target`,
seletores) — a mesma regra para todos:

| você escreve | o carregador procura |
|---|---|
| `loja-db` | no projeto que declara; se não achar, em `shared` |
| `shared/gateway-pagamento` | exatamente ali — barra é caminho completo |
| `estoque/estoque-api` | em outro projeto |

`shared` é o único nome de projeto reservado. Uma referência nua **não é global**:
para atravessar projeto, qualifique.

## 2. Os seis documentos

`kind: element | relation | diagram | flow | note | project` no topo, ou as chaves
de lista `elements:`, `relations:`, `diagrams:`, `flows:`, `notes:`.

| documento | é |
|---|---|
| **elemento** | uma caixa |
| **relação** | uma seta entre duas caixas |
| **diagrama** | uma visão estrutural — *o mapa* |
| **fluxo** | um caso de uso como sequência — *a história* |
| **nota** | uma anotação: risco, dúvida, bloqueio, decisão |
| **projeto** | a ficha da própria pasta — opcional; só dá nome e ordem a ela |

## 3. O nível vem do `parent` — sempre

```
sem parent          -> contexto (sistema)
filho de sistema    -> container
filho de container  -> componente
filho de componente -> código
```

**Não se declara nível.** `level:` existe como campo, mas discordar da hierarquia
gera aviso e a árvore vence. Caixa no nível errado = `parent` errado.

Escolher o `parent` **é** escolher a abstração C4 — e isso é decisão do arquiteto
(`c4.md`).

## 4. Elemento

| campo | se omitido |
|---|---|
| `id` | **obrigatório**, único no projeto |
| `name` | o `id` |
| `shape` | `system` |
| `parent` | nenhum → é um sistema |
| `description` | — (não é desenhada; sai no hover) |
| `technology` | — (letra pequena na caixa) |
| `tags` / `meta` | `[]` / `{}` |
| `relations` / `notes` | `[]` — aninhadas, com `from`/`target` implícitos |
| `bind` | — → é o **espelho** de outra modelagem: `{ modelagem, ref }` (§5) |

`shape` prontos: `system`, `external`, `actor`, `bot`, `browser`, `api`,
`database`, `queue`, `topic`, `container`, `component`, `class` — e o que a
modelagem tiver acrescentado, que `cfour config show` lista. **Shape é só
desenho**: não muda nível nem comportamento.

## 5. Relação

| campo | se omitido |
|---|---|
| `from` | **obrigatório**, exceto dentro da caixa de origem |
| `to` | **obrigatório** |
| `kind` | `sync` — prontos: `sync`, `async`, `event`, `batch`, `dep`, `peer` |
| `label` | — (curto: o que trafega; sai no hover, **não** no desenho) |
| `description` | — (forma longa; sai no hover) |
| `bidirectional` | `false` |
| `tags` / `meta` | `[]` / `{}` |
| `id` | derivado: `origem~tipo~destino` |

**Relação não tem `technology`.** Escrevê-lo numa seta não falha e não faz nada: o
protocolo vai no `label` ou na `description`.

**Cada integração se escreve uma vez, no nível mais fino que se conhece.** O
viewer sobe cada ponta até a caixa visível naquele desenho; a mesma seta em três
níveis é duplicidade.

**Atravessar modelagens:** `to:` nunca cita elemento de outra modelagem — cada uma
compila sozinha, e aquele id vira erro. O que atravessa é um **espelho**: uma caixa
`external` local com `bind: { modelagem, ref }` (o `ref` sempre qualificado), e a
seta aponta para o id local. Espelho é declaração manual, um por vizinho, e
envelhece com o modelo do outro — `cfour check --all` é o que confere as duas
pontas.

## 6. Diagrama — o mapa

| campo | se omitido |
|---|---|
| `id` | o nome do arquivo (único no projeto, compartilhado com fluxos) |
| `title` | o `id` |
| `scope` | nenhum → visão de topo |
| `include` | os filhos de `scope` |
| `exclude`, `where`, `groups`, `groupBy`, `subject` | — |
| `neighbors` | `0` |
| `relations` | `auto`; também `none`, `[ids]`, `{ exclude: [ids] }` |
| `order` | `500` |
| `tags` / `meta` | `[]` / `{}` |

- **Um diagrama seleciona, e não lista.** `scope: X` sem `include` mostra os
  **filhos** de X — e uma caixa nova entra sozinha. Listar membro a membro produz
  um desenho que congela.
- `scope` faz quatro coisas: escolhe membros, desenha a moldura, é o destino do
  descer e a origem do subir. **A caixa do `scope` não é membro do próprio diagrama.**
- Seletores em `include`/`exclude`: `ref`, `children`, `descendants` (+`depth`),
  `tag`, `meta`, `level`, `shape`, `project`. Em `where`/`match` só os predicados.
  Dentro de uma chave vale **OU**, entre chaves **E**. **Não há negação.**
- `groupBy: meta.<chave> | level | shape | project`; só age se `groups` não
  existir. Etiqueta não agrupa: banda é partição.
- **O viewer nunca inventa visão.** Caixa com filhos e sem diagrama com `scope:`
  apontando para ela → **conteúdo inalcançável**, avisado na carga.

## 7. Fluxo — a história

**Um fluxo não cria caixa nenhuma.** Ele percorre as que existem, e cada passo
deveria ser uma seta já declarada. Quando não é, o viewer avisa e desenha `!`.

| campo | se omitido |
|---|---|
| `id` | nome do arquivo — **não pode colidir com id de diagrama do projeto** |
| `title` | o `id` |
| `scope` | nenhum — dá a trilha; **não escolhe os participantes** |
| `level` | o nível mais fino que os passos citam. Escrito, só vale `context`, `container`, `component` ou `code` — **em inglês** |
| `main` | `{ name: Principal, outcome: success }` |
| `participants` | ordem de primeira aparição |
| `steps` | **obrigatório** — um fluxo sem passos é erro |
| `paths` | `[]` |

**Passo:** `to` é o único obrigatório; `from` omitido herda o `to` do anterior.
`from` e `to` resolvem pela regra do §1, **e não pelo passo anterior** — num fluxo
que atravessa projetos, qualifique. Errar aqui é **erro**, não aviso.

**As três exceções legítimas de passo sem seta declarada:** a resposta volta pela
seta que levou a pergunta; `from` e `to` são a mesma caixa; uma ponta está dentro
da outra.

**Um fluxo com erro não carrega inteiro** — o sintoma é `0 fluxo(s)` no check, sem
nada apontando o passo culpado. Rodar o check depois de mexer em fluxo não é
opcional.

## 8. Nota

| campo | se omitido |
|---|---|
| `text` | **obrigatório** |
| `kind` | `info` — prontos: `risk`, `blocker`, `warning`, `question`, `info`, `tip` |
| `target` | nenhum → post-it solto (exige `scope`) |
| `scope` | nenhum → acompanha a caixa em todo diagrama |
| `meta` | `{}` — sai no hover |

Sem `target` **e** sem `scope` → descartada com aviso. É onde risco, dúvida e
decisão pendente devem morar, porque a nota vira filtro no viewer — e um
comentário no YAML não.

## 9. `tags` e `meta`

- `tags`: sinalizador acumulável, a caixa tem ou não tem.
- `meta`: classificação com valor (`domain: vendas`, `owner: squad-checkout`).
- Toda chave de `meta` vira filtro sozinha — o filtro se ganha escrevendo o dado.
- Valor de `meta` que é `http(s)://` vira link na caixa e **não** vira filtro.
- **`metadata` sem `color: true` filtra e não colore**, e não há aviso nenhum: a
  chave aparece com o nome cru e não entra em "Colorir por". Declarar é
  `cfour config set metadata <chave> --label … --color …`.

## 10. Configuração

`$M/model/workspace.yaml` é somado item por item sobre o padrão do motor.
Registros abertos — acrescentar uma entrada basta: `shapes`, `relationKinds`,
`noteKinds`, `flowOutcomes`, `palette`, `metadata`.

**Usar um `kind`, `shape` ou `outcome` novo exige declará-lo antes**
(`cfour config set`). Sem isso ele funciona degradado e com aviso.

## 11. Erro e aviso

Nada é fatal: o modelo carrega degradado e os problemas sobem para o topo da tela.

- **erro** = aquilo não carregou (id inválido ou repetido, `parent` ou `scope`
  inexistente, seta apontando para o nada, ciclo, fluxo com passo quebrado);
- **aviso** = carregou degradado (shape/kind/outcome desconhecido, `level`
  divergente, nota órfã, passo de fluxo sem seta declarada, conteúdo inalcançável);
- o modelo YAML **nunca é reescrito** pelo viewer; a única coisa que ele grava é
  `<projeto>/.layout/<diagrama>.json`, que vai para o git.

Não reproduza a lista inteira: rode `cfour check`.

## 12. O que não existe

Não prometa: negação em seletores · filtro que esconde ou reorganiza (ele
escurece) · "Colorir por" fora das chaves com `color: true` · exportar SVG ·
desfazer o arraste · busca por caixa na barra lateral · em fluxo, molduras
`alt`/`loop`/`opt`, paralelismo e laço · `folder.yaml` renomeando pasta na árvore ·
seta direta entre modelagens.
