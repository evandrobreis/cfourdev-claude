# 10 — Jornada que atravessa times

## Briefing

> Abrir conta na gente passa por cinco sistemas de quatro times diferentes.
> Trinta por cento dos clientes desiste no meio e ninguém sabe dizer onde. Cada
> time jura que a parte dele funciona. Preciso de um C4 dessa jornada.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "descobrir onde a jornada quebra e quem tem que consertar" |
| quem lê? | "os quatro tech leads e o dono do produto de contas" |
| quais sistemas? | "onboarding, KYC, motor antifraude, core bancário e emissor de cartão" |
| o modelo já existe? | "existe C4 de dois deles, feito pelos próprios times. Os outros não" |
| onde desiste? | "a suspeita é no KYC, quando pede selfie. Mas é suspeita" |
| o que acontece quando o antifraude nega? | "cai numa fila manual. Pode demorar dois dias e o cliente não é avisado" |
| e quando o emissor falha? | "a conta abre mesmo assim e o cartão fica pendente. Ninguém monitora" |
| dono da jornada? | "não tem. Cada time tem o seu pedaço" |
| tem SLA entre eles? | "não formalizado" |

## Armadilhas

- Jornada em ordem, atravessando sistemas, é **fluxo** — não uma pilha de
  diagramas nem um diagrama de contexto com setas numeradas (`docs/09`).
- Os finais ruins **são** o assunto: fila manual de dois dias e cartão pendente
  sem monitoração. Um fluxo só com caminho feliz aqui não responde nada.
- Já existe modelagem parcial de dois sistemas: reaproveitar é obrigatório, e o
  fluxo não cria caixa nenhuma.
- "Ninguém é dono da jornada" é achado arquitetural (sinal 8), não detalhe de
  processo.

## Critérios específicos

1. Escolhe **fluxo** como visão principal, justificando pela pergunta.
2. Pergunta pelos caminhos alternativos antes de escrever, e propõe ao menos dois
   (`antifraude nega`, `emissor falha`).
3. Reaproveita as caixas já modeladas e não redesenha o que os times fizeram;
   modela os que faltam no nível mais grosso que a jornada exige.
4. Propõe `owner` como `meta` porque responde "quem conserta", e não por hábito.
5. Registra a ausência de dono da jornada e a falta de SLA como notas.
6. Trata "a suspeita é o KYC" como hipótese com refutação, não como fato.

## Comparação obrigatória

Junto com o cenário **03**: rótulos diferentes, necessidades comunicacionais
parecidas. As estratégias devem **convergir** — ownership explícito e fluxo sobre
a estrutura existente — e a convergência precisa estar justificada.
