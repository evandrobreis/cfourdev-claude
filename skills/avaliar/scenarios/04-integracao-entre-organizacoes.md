# 04 — Integração entre organizações

## Briefing

> Somos um banco médio e vamos integrar com uma fintech parceira para oferecer
> crédito dentro do app deles. O contrato está sendo negociado. Preciso de um
> desenho que mostre onde acaba a nossa responsabilidade e começa a deles.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "fechar o anexo técnico do contrato. Tem cláusula de SLA e de dado pessoal" |
| quem lê? | "arquiteto deles, arquiteto nosso, e o pessoal de compliance dos dois lados" |
| compliance entende arquitetura? | "não. Precisa entender quem guarda o dado do cliente e quem responde se vazar" |
| o que vocês expõem? | "uma API de proposta de crédito e um webhook de status" |
| o que eles expõem? | "um endpoint para a gente confirmar a identidade do cliente" |
| dados? | "CPF e renda vêm deles. O score é nosso e não pode sair daqui" |
| e se cair? | "se a nossa API cair, eles não conseguem ofertar. Não tem fila no meio" |
| vocês modelam o sistema deles? | "a gente não sabe o que tem dentro. Nem quer saber" |

## Armadilhas

- O sistema do parceiro é **caixa fechada**: `shape: external`, sem interior
  inventado. Detalhar o que não se conhece é o pior erro possível aqui.
- Fronteira de responsabilidade ≠ fronteira de arquivo. O que decide o desenho é
  quem responde legalmente, não onde o YAML mora.
- Compliance é audiência não técnica com pergunta específica (onde o dado mora) —
  isso é uma visão própria, com perspectiva de dados.

## Critérios específicos

1. O parceiro entra como `external`, e o plugin recusa detalhar o interior dele.
2. Reconhece duas audiências com perguntas diferentes e propõe visões separadas.
3. Trata a titularidade do dado (CPF, renda, score) como perspectiva de dados que
   atravessa níveis, não como um nível C4.
4. Levanta SLA, timeout, propagação de falha e ausência de fila (sinal 2), e
   propõe registrar como nota `risk`.
5. Pergunta quem é dono do contrato de cada endpoint e o que acontece na mudança.
6. Não presume que a integração precise de fluxo — mas pergunta se a conversa de
   contrato depende da ordem das chamadas.

## Comparação obrigatória

Junto com o cenário **11**: nos dois há duas organizações. Aqui a fronteira entre
elas **é** o desenho, então tudo vive numa modelagem só — o parceiro como
`external`, ou como um segundo projeto. Lá nada atravessa, e são duas modelagens.
As estratégias devem sair **diferentes**, e a diferença precisa estar justificada
pelo que precisa aparecer junto — nunca por "são organizações distintas", que é
verdade nos dois.
