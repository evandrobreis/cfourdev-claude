# Exemplos canônicos — a forma inteira, um trecho por vez

O `viewer-contract.md` diz **quais campos existem**. Este arquivo mostra **como
eles ficam juntos**, que é o que uma tabela de campos não consegue mostrar.

Está aqui dentro, e não numa URL, de propósito: você escreve YAML durante a
conversa, e nesse momento não deve depender de rede nem de o arquiteto ter algo
instalado. As duas modelagens completas, com todos os arquivos, estão em
`doc:exemplos` — vá lá quando precisar ver uma modelagem inteira, e não um
trecho.

Os exemplos usam o vocabulário de uma loja com estoque: os projetos `loja`,
`estoque` e `shared`. Nada aqui descreve sistema real nenhum.

---

## Várias caixas num arquivo só

O caso comum. `parent: loja` põe as três em profundidade 1 — nível `container` —
e dentro da moldura de qualquer diagrama com `scope: loja`.

```yaml
# model/loja/elements/containers.yaml
elements:
  - id: loja-web
    name: Loja Web
    shape: browser
    parent: loja
    technology: React
    description: SPA da vitrine e do carrinho.
    tags: [core]
    meta:
      domain: vendas
      owner: squad-vitrine

  - id: loja-api
    name: API da Loja
    shape: api
    parent: loja
    technology: .NET 8
    description: Regras de pedido — monta o carrinho, aplica preço e fecha a compra.
    tags: [core, pci]
    meta:
      domain: vendas
      owner: squad-checkout
      criticality: alta
      # Valor de `meta` que É uma URL vira link na caixa. Não há campo `links:`.
      adr: https://exemplo.interno/adr/014-motor-de-precos

  - id: loja-db
    name: Base da Loja
    shape: database
    parent: loja
    technology: PostgreSQL
    description: Pedidos, carrinhos e itens.
```

Ninguém declarou que `loja` é um sistema: ela não tem `parent`, e uma raiz **é**
um sistema. O nível vem da árvore, nunca de um campo.

## Tudo sobre uma caixa no mesmo arquivo

A forma preferida para setas: elas nascem **dentro da caixa de origem**, e o
`from` fica implícito. Acrescentar uma dependência é uma linha no arquivo que
você já tem aberto.

```yaml
# model/loja/elements/checkout/pedido-service.yaml
kind: element
id: pedido-service
name: PedidoService
shape: component
parent: loja-api
technology: C#
description: Orquestra o fechamento do pedido.

relations:
  - to: pedido-repository
    kind: sync
    label: Persiste
  - to: preco-client
    kind: sync
    label: Cota preço
  - to: pedido-confirmado
    kind: event
    label: Publica
    description: Um evento por pedido aprovado, particionado por id do cliente.

# Nota de elemento: sem `scope`, ela acompanha PedidoService em TODO diagrama
# onde ele aparece.
notes:
  - kind: risk
    text: Acoplado ao cálculo de preço do legado.
  - kind: question
    text: Quem é dono da regra de frete?
```

## Setas em arquivo separado — os dois casos que justificam

Só dois: a seta liga dois projetos e nenhum é dono dela, ou a **origem** mora em
`shared/`, e um projeto consumidor não deve editar arquivo compartilhado para se
declarar.

```yaml
# model/loja/relations/integracoes.yaml
relations:
  - from: loja-web
    to: loja-api
    kind: sync
    label: Chama
    meta:
      protocolo: REST

  # Atravessa projeto: o destino é qualificado.
  - from: loja-api
    to: estoque/estoque-api
    kind: sync
    label: Reserva

  # A origem mora em `shared`, então não dá para co-locar lá.
  - from: shared/erp-corporativo
    to: loja-api
    kind: batch
    label: Carga de preços
```

## Visão de topo curada — sem `scope`

Sem `scope` é a raiz: subir de qualquer lugar termina aqui. Os membros são
nomeados um a um, porque um diagrama de contexto é um conjunto **curado**, e não
mecânico.

```yaml
# model/loja/diagrams/contexto.yaml
kind: diagram
id: contexto
title: Loja Online — Contexto
level: context
order: 10

include:
  - ref: loja
  - ref: shared/cliente
  - ref: shared/gateway-pagamento
  - ref: estoque/estoque

neighbors: 1
relations: auto
subject: loja

notes:
  # Sem `target`: adesivo flutuante no canvas deste diagrama.
  - kind: info
    text: Diagrama congelado para a revisão de arquitetura de 2026-Q1.
```

## Diagrama mínimo, e o mesmo diagrama com curadoria

`scope` e mais nada: `include` omitido é `{ children: loja }` — todo container do
sistema, sem listar nenhum. Quando um container novo nascer amanhã, ele entra
sozinho.

```yaml
# model/loja/diagrams/containers.yaml
kind: diagram
id: containers
title: Loja Online — Containers
scope: loja
```

A versão que já cresceu, com recorte, bandas e uma nota local:

```yaml
kind: diagram
id: containers
title: Loja Online — Containers
scope: loja
order: 20

exclude:
  - ref: loja-legacy
neighbors: 1

# Agrupamento lógico. Grupos aninham: a banda mais interna reivindica primeiro.
groups:
  - id: experiencia
    name: Experiência
    orientation: row
    include: [loja-web]
  - id: dominio
    name: Domínio
    match:
      meta:
        layer: domain
    groups:
      - id: dados
        name: Dados
        match:
          shape: [database, topic]

notes:
  # Com `target` E `scope`: aparece só neste desenho.
  - target: loja-api
    scope: containers
    kind: warning
    text: "Só neste desenho: o retry da chamada de estoque é manual."
```

## Fluxo completo — as três exceções, o caminho triste e o `reply`

Um fluxo **não cria caixa nenhuma**: cada passo percorre uma seta que já existe.
Escreva no nível mais fino que o modelo tem; a projeção sobe as pontas sozinha.

```yaml
# model/loja/flows/checkout.yaml
kind: flow
id: checkout
title: Fechar pedido
scope: loja
level: container          # context | container | component | code — em inglês
order: 10

main:
  name: Pedido aprovado
  outcome: success

# Só a espinha. Quem não está aqui entra na ordem da primeira aparição.
participants:
  - shared/cliente
  - loja-web
  - loja-api

steps:
  - id: escolhe
    from: shared/cliente
    to: loja-web
    label: Escolhe itens

  - to: loja-api                    # `from` implícito: o `to` do passo anterior
    label: Fecha pedido

  # EXCEÇÃO 3 — uma ponta está dentro da outra: a relação entre elas é a
  # contenção, e não há seta a declarar. Lido em containers, este passo some.
  - to: pedido-service
    label: Orquestra o fechamento

  # EXCEÇÃO 1 — a resposta volta pela seta que levou a pergunta. O rótulo da ida
  # não é emprestado; `reply` é curto e tracejado na linha seguinte.
  - to: shared/erp-corporativo
    label: Consulta preço
    reply: Preço e impostos

  # EXCEÇÃO 2 — `from` e `to` na mesma caixa: ação interna.
  - from: pedido-service
    to: pedido-service
    label: Aplica desconto e frete

  - id: cobra
    from: pedido-service
    to: shared/gateway-pagamento
    label: Autoriza

paths:
  - id: recusado
    name: Pagamento recusado
    outcome: failure
    # `from` é o id do passo de desvio, INCLUSIVE ele: o que muda quase sempre é
    # a resposta àquele passo.
    from: cobra
    steps:
      - to: pedido-service
        label: Recusado (saldo insuficiente)
      - to: loja-web
        label: Informa recusa
```

**Um fluxo com erro não carrega inteiro.** Depois de mexer em fluxo, rodar
`cfour check` não é opcional.

## Notas presas a caixa e a diagrama

```yaml
# model/loja/notes/riscos.yaml
notes:
  - target: loja-api
    kind: risk
    text: Ponto único de falha para o fechamento de pedido.
    meta:
      raisedBy: arquitetura
      date: "2026-03-01"

  # Sem `scope`: acompanha loja-db em todo diagrama onde ele aparece.
  - target: loja-db
    kind: tip
    text: Backup point-in-time de 7 dias.

  # Com `scope`: só no diagrama de containers.
  - target: loja-db
    scope: containers
    kind: question
    text: Vale separar a réplica de leitura?
```

Nota **se escreve pela chave de lista `notes:`**, ou aninhada na caixa ou no
diagrama — nunca como documento com `kind: note` no topo, onde o `kind` já é o do
documento e não sobra onde declarar `risk`.

## O espelho — a única forma de atravessar modelagens

`to:` **nunca** cita elemento de outra modelagem: cada uma compila sozinha, e
aquele id vira erro. O espelho é uma caixa `external` local.

```yaml
- id: pedido-confirmado-loja
  name: Pedido Confirmado
  shape: external
  bind:
    modelagem: vendas               # o id no registro
    ref: loja/pedido-confirmado     # sempre qualificado
```

Lida sozinha é uma caixa comum. Lidas juntas, o espelho se dissolve no elemento
real e a seta chega nele. Espelho não tem filhos, e um punhado deles é normal —
uma dúzia significa que era uma modelagem só, com dois projetos.

## Configuração e vocabulário da modelagem

Somado **item por item** sobre o `view.yaml` do motor, então pode ser tão curto
quanto um título.

```yaml
# model/workspace.yaml
version: 2
title: Arquitetura

# Toda chave de `meta` escrita no modelo já vira filtro sozinha. Este bloco faz
# DUAS coisas e só duas: `label` (o nome legível) e `color: true` (libera a chave
# em "Colorir por").
metadata:
  domain:
    label: Domínio
    color: true
  owner:
    label: Time
  criticality:
    label: Criticidade
    color: true
```

Usar um `kind`, `shape` ou `outcome` novo **exige declará-lo aqui antes**. Sem
isso ele funciona degradado e com aviso — nunca some, mas não é o que você quis
dizer.
