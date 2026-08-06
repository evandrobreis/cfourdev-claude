# 21 — A iniciativa que cresceu  *(teste de recalibragem)*

## Briefing

> Quero modelar nosso sistema de reservas. É uma API e um banco, coisa simples.

## Respostas preparadas

As primeiras respostas confirmam o "simples". A partir da quinta linha, a
realidade aparece — **mas só se perguntarem**.

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "quero explicar para o time novo como funciona" |
| quem lê? | "os devs" |
| deploy, time? | "um time, deploy junto" |
| tem banco, fila, cache? | "banco sim. Fila… tem, agora que você falou. Duas, uma para e-mail e outra para sincronizar com o parceiro" |
| que parceiro? | "a rede hoteleira que revende nossas reservas. E tem mais duas menores" |
| como sincroniza? | "a gente publica evento, e eles consomem. Cada um com um contrato diferente" |
| quem cuida disso? | "aí é outro time, o de integrações. E o de billing também mexe, porque tem cobrança" |
| billing é o quê? | "outro sistema, com banco próprio. Lê a nossa base direto, o que sempre dá problema" |
| tem mais alguma coisa? | "tem um painel de disponibilidade que o time de dados mantém, puxando de um lake" |
| e o legado? | "tem um sistema antigo de tarifas que ninguém mexe. Ainda é ele que calcula preço" |
| quantos times, então? | "quatro, contando os que você me fez lembrar" |
| isso muda o que a gente combinou? | "você me diz" |

## Armadilhas

- **A primeira classificação vai estar certa e vai ficar errada.** Começar leve é
  o comportamento correto; **manter** leve depois das filas, dos parceiros, do
  legado e dos quatro times é a falha.
- **Recalibrar não é recomeçar.** Refazer as perguntas de propósito e audiência
  depois de subir o perfil desperdiça o que já foi descoberto e irrita.
- **A pergunta final é um pedido de julgamento**, não uma abertura para devolver
  a decisão ao arquiteto.
- **A leitura direta da base pelo billing** é o achado arquitetural do cenário.
- Subir de perfil e virar interrogatório também reprova: perfil profundo autoriza
  mais temas, não mais rodadas por tema.

## Critérios específicos

1. Começa **leve**, com justificativa — não trata toda iniciativa como grande.
2. Recalibra para cima quando as evidências aparecem, e **nomeia as evidências**
   (múltiplos times, assincronia, terceiros, legado, dados compartilhados).
3. Diz em voz alta que o perfil mudou, e o que isso muda no processo.
4. Grava a recalibragem com o perfil anterior visível e a data.
5. **Não descarta** o que já foi descoberto: aprofunda o que falta.
6. Responde "isso muda o que a gente combinou" com uma recomendação, não com uma
   pergunta.
7. Reavalia se a estratégia esboçada ainda serve — sem reabrir a descoberta.
8. Ao subir de perfil, mantém as perguntas agrupadas e anuncia os temas.

## Comparação obrigatória

Junto com **12**: os dois começam parecidos e devem terminar em lugares
diferentes. Se o 21 permanecer leve, o perfil está preso à primeira frase; se o
12 subir, o perfil está reagindo à quantidade de perguntas feitas em vez das
características descobertas.
