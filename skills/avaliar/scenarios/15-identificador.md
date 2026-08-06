# 15 — O identificador  *(teste de derivação)*

## Preparação

O repositório descartável deste cenário se chama **`plataforma-de-cobranca`**, e
já tem uma modelagem registrada no `cfour.yaml`:

```yaml
version: 1
active: cobranca
modelagens:
  - id: cobranca
    name: Cobranca recorrente
    path: ./cobranca
```

## Briefing

> Vou começar a modelar a **régua de cobrança** — a parte de tentativas,
> retentativas e negativação. É outra coisa da cobrança recorrente que já está
> aí: outro time, outro comitê, e não desenha junto.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "quantas tentativas e em que ordem — e onde entra a negativação" |
| quem lê? | "o time de crédito e o jurídico" |
| relação com a cobrança recorrente? | "ela dispara a régua, e é só isso. Uma chamada" |
| alguma caixa aparece nas duas? | "o serviço de cobrança, que é o que dispara" |
| o vocabulário é o mesmo? | "não. Aqui 'ciclo' é o ciclo de negativação; lá é o ciclo de faturamento" |
| ciclo de revisão? | "separado. O jurídico revisa o meu, o time de billing revisa o deles" |
| o que você quer chamar isso? | "não pensei nisso ainda" |
| pode ser `regua-de-cobranca`? | "pode, tanto faz" |
| tem convenção de nome? | "não temos convenção nenhuma" |

## Armadilhas

- **"Régua de cobrança" já é o nome.** O id sai daí, e a pergunta "o que você
  quer chamar isso?" não deveria existir.
- **Existe conflito potencial**: `cobranca` já está registrado, e um id como
  `cobranca-regua` ou `regua-cobranca` precisa ser escolhido com isso em conta —
  este é o único ponto do cenário em que apresentar o conflito é obrigatório.
- **Não é uma pergunta sobre slug, é sobre realidade.** Vocabulário conflitante
  ("ciclo"), ciclos de revisão separados e uma seta atravessando: dá modelagem
  nova com espelho, e o custo do espelho precisa ser nomeado.
- Um plugin que resolve o id e esquece o corte acerta o teste menor e erra o
  maior.

## Critérios específicos

1. **Propõe** o id derivado do nome que já apareceu, sem perguntar qual o
   arquiteto quer.
2. Menciona o custo do id (URL, comandos, pasta da memória) **uma vez**, junto
   com a proposta — não como pedido de deliberação.
3. Nota que `cobranca` já existe e que o id novo não pode colidir nem confundir.
4. Não bloqueia o fluxo esperando escolha manual: segue com o id proposto se o
   arquiteto não objetar.
5. Aplica o corte de modelagem × projeto pelo que atravessa e pelo conflito de
   glossário — não por "é outro time".
6. Nomeia o custo do espelho (`bind`), declarado à mão, um por vizinho.
7. Registra `ciclo` no glossário da modelagem em que o termo foi usado.
