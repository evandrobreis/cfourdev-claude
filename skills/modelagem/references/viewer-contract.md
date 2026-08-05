# Contrato do cfourdev — índice normativo

**Duas regras antes de tudo:**

1. **Não invente campo, `shape`, `kind`, `outcome` ou comportamento.** Em dúvida,
   abra `docs/08`. O que não está lá não existe.
2. **Os números dos documentos já mudaram uma vez.** Se um documento citado aqui
   não existir, consulte o índice antes de citar.

## Onde a documentação mora

Ela **não** está no repositório de quem usa o plugin: mora no repositório do
cfourdev, e `docs/NN` neste arquivo é abreviação de

```
https://github.com/evandrobreis/cfourdev/blob/v0.3.0/docs/NN-*.md
```

O índice é `docs/README.md` no mesmo lugar. A tag é fixa de propósito: o
`formatVersion: 1` do bundle é contrato, e a documentação que o descreve não
pode se mexer debaixo do pé desta skill. Quando o plugin subir de versão, a tag
sobe junto — as duas coisas mudam no mesmo commit ou não mudam.

Buscar essas páginas custa uma ida à rede. Faça isso quando a regra abaixo não
bastar; o índice existe justamente para bastar na maioria das vezes.

Este arquivo é um **índice**, não uma cópia: cada regra em uma linha, com o
documento onde ela mora. A doc é a fonte; duplicá-la aqui garantiria divergência.

---

## 1. Onde os arquivos ficam (`docs/02`, `docs/08`, `docs/10`)

- O motor lê **uma raiz de modelagem por vez**: o `model/` de uma modelagem. Qual
  delas é assunto do núcleo ("A modelagem ativa"); daqui para baixo, `model/`
  quer dizer `$M/model/`.
- Uma pasta diretamente sob `model/` **é** um projeto; o nome da pasta é o id.
- Todo o resto é arranjo livre: `elements/`, `relations/`, `diagrams/`, `flows/`,
  `notes/` são sugestão. O viewer lê **todos** os `.yaml` do projeto e descobre o
  conteúdo pelo documento, não pelo caminho.
- Exceções da leitura: `workspace.yaml` e pastas que começam com ponto (`.layout/`).
- Arquivo solto na raiz, fora de projeto: ignorado com aviso.
- Ids são locais ao projeto e viram `projeto/id` internamente. Válidos: letras,
  números, `.`, `-`, `_`. A barra é reservada.
- Um arquivo pode ter vários documentos separados por `---`.
- Não existe índice, lista mestra nem registro a manter.

**Resolução de referência** (`parent`, `to`, `from`, `ref`, `scope`, `target`):

| você escreve | o viewer procura |
|---|---|
| `loja-db` | no projeto que declara; se não achar, em `shared` |
| `shared/gateway-pagamento` | exatamente ali — barra é caminho completo |
| `estoque/estoque-api` | em outro projeto |

## 2. Os cinco documentos (`docs/01`, `docs/02`)

`kind: element | relation | diagram | flow | note | project` no topo, ou as chaves
de lista `elements:`, `relations:`, `diagrams:`, `flows:`, `notes:`.

| documento | é |
|---|---|
| **elemento** | uma caixa |
| **relação** | uma seta entre duas caixas |
| **diagrama** | uma visão estrutural — *o mapa* |
| **fluxo** | um caso de uso como sequência — *a história* |
| **nota** | uma anotação: risco, dúvida, bloqueio, decisão |

## 3. O nível vem do `parent` — sempre (`docs/01`, `docs/03`)

```
sem parent          -> contexto (sistema)
filho de sistema    -> container
filho de container  -> componente
filho de componente -> código
```

- **Não se declara nível.** `level:` escrito à mão que discorde da hierarquia gera
  aviso e vence o escrito — não use isso para "consertar" um desenho.
- Caixa no nível errado = `parent` errado, nunca diagrama errado.
- A mesma hierarquia decide quatro coisas: nível, moldura, descer/subir e lifting.
- Teste container × componente: *"se eu derrubar isto sozinho, o resto continua de
  pé?"* Sim → container. Não → componente. (`docs/01`, `docs/09`)

## 4. Elemento (`docs/03`, `docs/08`)

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
`database`, `queue`, `topic`, `container`, `component`, `class`. Shape é só
desenho: não muda nível nem comportamento. Desconhecido → caixa cinza + aviso.

## 5. Relação (`docs/03`, `docs/04`)

| campo | se omitido |
|---|---|
| `from` | **obrigatório**, exceto dentro da caixa de origem |
| `to` | **obrigatório** |
| `kind` | `sync` |
| `label` | — (curto: o que trafega; sai no hover, **não** no desenho) |
| `description`, `route`, `bidirectional`, `tags`, `meta` | — |
| `id` | derivado: `origem~tipo~destino`, repetidos ganham `#2` |

`kind` prontos: `sync`, `async`, `event`, `batch`, `dep`, `peer`. Convenção de
leitura: **ponta cheia é síncrono, ponta vazada é assíncrono**.

**Escreva cada integração uma vez só, no nível mais fino que você realmente
conhece.** O viewer sobe cada ponta até a caixa visível naquele desenho. Não
redesenhe a mesma seta em três níveis. Não sabe qual componente faz a chamada?
Escreva no container e mova depois — os níveis de cima continuam certos
(`docs/03`, `docs/09`).

**Abstração funde, detalhe separa** (`docs/04`): no diagrama em que a seta liga as
caixas que ela mesma cita, cada uma mantém sua linha; num nível acima, tudo que
sobe para o mesmo par vira uma linha só, com o número de integrações e o hover
listando as originais. Uma seta cujas duas pontas viram a mesma caixa não é
desenhada.

**Seta que nomeia o `scope` do diagrama** (`docs/04`): é desenhada **na moldura**,
e separada das setas dos membros — ela nunca falou de um componente, então não
funde com nenhum. É o que garante que descer de nível não perde integração. Já
uma caixa tirada por `exclude`/`where` leva as setas dela junto: isso é curadoria,
e sai em `invisibleRelations` no `--inventory`.

**Atravessar modelagens** (`docs/03`, `docs/10`): `to:` NUNCA cita elemento de
outra modelagem — cada uma compila sozinha e aquele id vira erro. Use um
**espelho**: caixa `external` local com `bind: { modelagem, ref }`, e a seta
aponta para o id local. Lida sozinha é uma caixa comum; lidas juntas o espelho se
dissolve no elemento real. `ref` sempre qualificado (`<projeto>/<id>`). Espelho
não tem filhos. Um punhado deles é normal; dez significam que era uma modelagem
só com dois projetos.

**Onde escrever:** dentro da caixa de origem, por padrão. Arquivo separado só em
dois casos: a origem mora em `shared/`, ou a seta liga dois projetos e nenhum é
dono dela.

## 6. Diagrama — o mapa (`docs/04`, `docs/08`)

| campo | se omitido |
|---|---|
| `id` | o nome do arquivo (único no projeto, compartilhado com fluxos) |
| `title` | o `id` |
| `scope` | nenhum → visão de topo, fim da subida |
| `include` | os filhos de `scope` |
| `exclude`, `where`, `groups`, `groupBy`, `subject` | — |
| `neighbors` | `0` |
| `relations` | `auto` (`none` = visão puramente estrutural) |
| `order` | `500` |

- `scope` faz quatro coisas: escolhe membros, desenha a moldura, é o destino do
  descer e a origem do subir. **A caixa do `scope` não é membro do próprio diagrama.**
- Seletores em `include`/`exclude`: `ref` (ou string solta), `children`,
  `descendants` (+`depth`), `tag`, `meta`, `level`, `shape`, `project`.
- Em `where`/`match` valem só os predicados: `tag`, `meta`, `level`, `shape`,
  `project`. Dentro de uma chave vale **OU**, entre chaves **E**. **Não há negação.**
- Ordem de montagem: include → where → exclude → neighbors → setas → bandas →
  subject → notas. Bandas nunca trazem alguém novo.
- **O anel não conversa consigo mesmo** (`docs/04`): seta entre dois vizinhos do
  MESMO salto não é desenhada — é contexto do escopo conversando entre si, e o
  leitor não a distingue de uma seta dos membros. Saltos diferentes sobrevivem,
  senão o segundo anel de `neighbors: 2` ficaria mudo. A moldura nunca conta como
  vizinho, então a seta que nomeia o `scope` não cai nessa regra.
- `groupBy: meta.<chave> | level | shape | project | tag:<prefixo>`; só age se
  `groups` não existir.
- A árvore lateral vem da **pasta** do arquivo; uma pasta `diagrams`/`flows` no
  começo do caminho é ignorada.
- **O viewer nunca inventa visão.** Caixa com filhos e sem diagrama com
  `scope:` apontando para ela → conteúdo inalcançável, avisado na carga.

## 7. Fluxo — a história (`docs/05`, `docs/08`)

**Um fluxo não cria caixa nenhuma.** Ele percorre as que já existem, e cada passo
deveria ser uma seta que já foi declarada. Quando não é, o viewer avisa e desenha
`!`: o fluxo **audita** a estrutura.

| campo | se omitido |
|---|---|
| `id` | nome do arquivo — **não pode colidir com id de diagrama do projeto** |
| `title` | o `id` |
| `scope` | nenhum — dá a trilha; **não escolhe os participantes** |
| `level` | o nível mais fino que os passos citam |
| `main` | `{ name: Principal, outcome: success }` |
| `participants` | ordem de primeira aparição |
| `steps` | **obrigatório** |
| `paths` | `[]` |

**Passo:** `to` é o único obrigatório; `from` omitido herda o `to` do anterior
(obrigatório no primeiro); `kind` herda o da seta declarada; `label` idem;
`reply` é uma resposta curta tracejada na linha seguinte; `id` só é preciso se
algum caminho desviar dali.

**Caminho:** `id` e `steps` obrigatórios; `from` é o id do passo de desvio,
**inclusive ele** (o que muda quase sempre é a resposta àquele passo); `outcome`
padrão `alternate` — registro aberto, ver `flowOutcomes`.

**As três exceções legítimas de passo sem seta declarada:**

1. a resposta volta pela seta que levou a pergunta (o rótulo da ida **não** é
   emprestado);
2. `from` e `to` são a mesma caixa — ação interna;
3. uma ponta está **dentro** da outra — a relação entre elas é a contenção.

Qualquer outro passo sem seta declarada é aviso e `!` no desenho: ou falta a
relação no modelo, ou a história está errada. **Descubra qual antes de escrever.**

**Projeção por nível:** o mesmo arquivo é lido em qualquer altura. Mensagem cujas
duas pontas caem na mesma caixa desaparece; chamada interna sobrevive; mensagens
iguais e seguidas se fundem (`×2`); coluna que passou a responder por outras mostra
`+N`.

**Fluxo não tem arquivo de layout** — toda coordenada sai da ordem do elenco e das
mensagens. A ordem das colunas se muda em `participants`, no arquivo.

**Um fluxo com erro não carrega inteiro** (`docs/08`): "uma história com um passo
quebrado conta a coisa errada". Por isso, depois de mexer em fluxo, rodar
`cfour check` não é opcional.

## 8. Nota (`docs/03`, `docs/08`)

| campo | se omitido |
|---|---|
| `text` | **obrigatório** |
| `kind` | `info` — prontos: `risk`, `blocker`, `warning`, `question`, `info`, `tip` |
| `target` | nenhum → post-it solto (exige `scope`) |
| `scope` | nenhum → acompanha a caixa em todo diagrama |

Sem `target` **e** sem `scope` → descartada com aviso. Notas viram filtro
("mostre só o que tem risco em aberto"). É onde risco, dúvida e decisão pendente
devem morar (`docs/09`).

## 9. `tags` e `meta` — o vocabulário da empresa (`docs/03`)

- `tags`: sinalizador acumulável, a caixa tem ou não tem (`pci`, `legado`, `core`).
- `meta`: classificação com valor (`domain: vendas`, `owner: squad-checkout`).
- Toda chave de `meta` vira filtro sozinha — **você ganha o filtro escrevendo o
  dado**, não configurando.
- Valor de `meta` que é `http(s)://` vira link na caixa e **não** vira filtro. Não
  existe campo `links:`.
- Legado ou descontinuado: `tags: [legado]` + `exclude` na visão que ele polui
  (`docs/09`).

## 10. Configuração (`docs/07`)

O `view.yaml` que vem dentro do `cfour` é do motor; `$M/model/workspace.yaml` é
da modelagem e é somado **item por item** sobre ele. Registros abertos — acrescentar uma entrada basta,
sem código: `shapes` (combinando `primitive`/`stereotype`/`palette`/`outline`/`size`),
`relationKinds`, `noteKinds`, `flowOutcomes`, `palette`, `metadata` (só `label` e
`color: true` agem).

**Usar um `kind`, `shape` ou `outcome` novo exige declará-lo antes.** Sem isso ele
funciona degradado e com aviso — nunca some, mas não é o que você quis dizer.

## 11. O que é erro e o que é aviso (`docs/08`)

Nada é fatal: o modelo carrega degradado e os problemas sobem para o topo da tela.
Não reproduza a lista aqui — rode `cfour check`. O que importa saber:

- **erro** = aquilo não carregou (id inválido/repetido, `parent` ou `scope`
  inexistente, seta apontando para o nada, ciclo, fluxo com passo quebrado);
- **aviso** = carregou degradado (shape/kind/outcome desconhecido, `level`
  divergente, nota órfã, passo de fluxo sem seta declarada);
- ciclo de hierarquia é reportado **e desfeito**;
- o modelo YAML **nunca é reescrito** pelo viewer; a única coisa gravada é
  `model/<projeto>/.layout/<diagrama>.json`, que vai para o git.

## 12. O que não existe (`docs/08`, "Limites conhecidos")

Não prometa nada disto:

- negação em seletores (só `exclude`);
- filtro que esconde ou reorganiza — ele apenas escurece;
- **Colorir por** fora das chaves marcadas com `color: true`;
- exportar SVG ou modo de impressão (há PNG);
- desfazer o arraste;
- busca por caixa na barra lateral (a busca acha visões);
- em fluxo: molduras `alt`/`loop`/`opt`, paralelismo, laço; resposta com descrição
  própria (só `reply` curto); filtro que estreite a sequência;
- `relations: [ids]` é frágil (exige ids derivados à mão) — prefira `exclude` de
  caixas ou um `where` mais estreito;
- `metadata.<chave>.facet` não tem efeito; `animated` em tipo de seta, idem;
- `folder.yaml` não renomeia nem reordena a pasta na árvore;
- seta DIRETA entre modelagens (`to: outra-modelagem/x`) — existe o espelho, §5.

## 13. Exemplos canônicos

Todos na modelagem `exemplos-c4` do repositório do cfourdev, que existe para
isto. Prefixo:

```
https://github.com/evandrobreis/cfourdev/blob/v0.3.0/examples/exemplos-c4/
```

Eles **não** estão no repositório de quem usa o plugin. Cite-os pelo endereço, e
só vá buscar um quando a regra acima não bastar.

| arquivo | mostra |
|---|---|
| `model/loja/elements/containers.yaml` | várias caixas e setas num arquivo só |
| `model/loja/elements/checkout/pedido-service.yaml` | setas co-locadas na caixa de origem |
| `model/loja/relations/integracoes.yaml` | setas entre projetos e a partir de `shared/` |
| `model/loja/diagrams/contexto.yaml` | visão de topo curada, sem `scope` |
| `model/loja/diagrams/containers.yaml` | diagrama mínimo: `scope` e mais nada |
| `model/loja/flows/checkout.yaml` | fluxo completo: caminhos tristes, `reply`, chamada interna, entrega para dentro |
| `model/estoque/flows/reserva.yaml` | fluxo que começa em outro projeto |
| `model/loja/notes/riscos.yaml` | notas presas a caixas e a diagramas |
| `model/workspace.yaml` | rótulos de `meta` e o vocabulário de uma modelagem |
