# 15 — O identificador  *(teste de derivação e de momento)*

O `id` tem duas maneiras de dar errado, e elas são opostas: **perguntá-lo** ao
arquiteto, e **fixá-lo antes de haver assunto**. Uma suíte que mede só a primeira
premia quem erra a segunda — um agente que espera o assunto ter nome parece um
agente que hesitou. Por isso este cenário tem **duas partes**, e elas medem
direções contrárias.

Cada parte roda no **seu** diretório descartável e na **sua** conversa, com um
subagente por parte. O placar do cenário é a soma das duas: reprova se qualquer
uma reprovar.

---

# Parte A — o id se propõe, não se pergunta

## Preparação

O repositório descartável desta parte se chama **`plataforma-de-cobranca`**, e
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

---

# Parte B — o id espera o assunto ter nome

## Preparação

Um repositório descartável **sem `cfour.yaml`** — nem nele, nem em nenhum
diretório acima —, sem `.claude/cfour/` e sem modelagem nenhuma. O diretório se
chama **`acme-backend`**, e esse nome **não** é o do que será modelado. É o ponto
inteiro da parte: é o único nome disponível no momento do diagnóstico, e é o
nome errado.

O `cfour` **está** no PATH, como numa máquina de quem já modelou antes. É o caso
mais duro de propósito: sem CLI a instalar e sem registro, o relatório do setup
fica **sem oferta nenhuma**, e é aí que a tentação de preencher o vazio com um
`cfour init` aparece.

## Briefing

> Instalei o plugin agora. Este repositório aqui ainda não tem nada de modelagem
> — o que eu preciso fazer para começar?

O briefing **não diz o assunto**. Ele só aparece quando alguém perguntar.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| o que você vai modelar? | "a régua de cobrança — tentativas, retentativas e negativação" |
| que decisão isso apoia? | "quantas tentativas e em que ordem, e onde entra a negativação" |
| quem lê? | "o time de crédito e o jurídico" |
| e o `acme-backend`, é o sistema? | "não. É o repositório onde eu trabalho; a régua nem mora nele ainda" |
| pode ser `regua-de-cobranca`? | "pode" |
| tem convenção de nome? | "não temos convenção nenhuma" |
| que nome dar à modelagem? | "não pensei nisso ainda" |

## Armadilhas

- **`acme-backend` é o único nome disponível no diagnóstico**, e é exatamente o
  que não pode virar id. Um agente que deriva cedo escreve `acme-backend` na URL
  do viewer e no nome da pasta da memória, e descobre o erro depois de o link
  já ter sido compartilhado.
- **O briefing convida a preparar estrutura**: "o que eu preciso fazer para
  começar?" parece um pedido de `cfour init`. Não é — é um pedido de setup, e a
  resposta honesta é o que falta, não um esqueleto.
- Esperar o assunto **não é hesitar**: quando a régua de cobrança é nomeada, o id
  sai dali na hora, proposto e não perguntado. Um agente que pergunta "que nome
  você quer?" nesse ponto erra a Parte A dentro da Parte B.

## Critérios específicos

1. No diagnóstico do repositório, **não** propõe `cfour init --id …` nem fixa id
   nenhum: relata que o `cfour.yaml` ainda não existe e nasce quando o assunto
   tiver nome.
2. O relatório do setup não propõe **nada** aqui — o CLI já está instalado, e a
   única oferta que este passo teria a fazer era essa. Criar registro ou id não
   entra na conta em hipótese nenhuma.
3. Encaminha para descobrir o propósito, e não para criar a primeira modelagem.
4. Quando a régua de cobrança é nomeada, propõe o id derivado **dela**
   (`regua-de-cobranca` ou equivalente), e nunca `acme-backend` ou `backend`.
5. Menciona o custo do id (URL, comandos, pasta da memória) **uma vez**, junto
   com a proposta. O diagnóstico pode citar o mesmo custo para explicar por que
   **não** está propondo id nenhum — isso é justificativa de abstenção, não
   deliberação, e não conta como a menção, desde que nenhum id tenha sido
   nomeado ali.
6. Não devolve a escolha do nome ao arquiteto em momento nenhum.
