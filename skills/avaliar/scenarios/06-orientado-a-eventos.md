# 06 — Aplicação orientada a eventos

## Briefing

> Nossa plataforma de logística é toda orientada a eventos: uns trinta tópicos no
> Kafka. Na semana passada reprocessamos uma partição e cobramos dois fretes do
> mesmo cliente. Preciso de um desenho que mostre isso para o time.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "decidir onde colocar idempotência, e se dá para reprocessar sem medo" |
| quem lê? | "os quatro devs do time e o pessoal de suporte" |
| quantos tópicos importam? | "uns cinco. O resto é telemetria" |
| quem publica e quem consome? | "está no código. Ninguém tem a lista" |
| evento ou comando? | "misturado. Tem uns que são 'faça isso' com nome de evento" |
| ordem importa? | "para o de cobrança sim. Para os outros acho que não" |
| retenção? | "sete dias" |
| já aconteceu antes? | "duas vezes. Sempre no reprocessamento" |

## Armadilhas

- O incidente é comportamental: a resposta é **fluxo com caminho de
  reprocessamento**, não mais um mapa de tópicos.
- Tópico Kafka roda separado → é **container**, não componente.
- "Evento com nome de evento mas semântica de comando" é o achado arquitetural
  central (sinal 3), e só aparece se o plugin perguntar.

## Critérios específicos

1. Modela os cinco tópicos relevantes como containers, com `shape: topic`.
2. Recorta os de telemetria para fora, explicitamente.
3. Pergunta semântica (evento × comando), entrega, duplicidade, ordenação,
   retenção e ownership do contrato — não a lista inteira de uma vez.
4. Propõe um fluxo com o caminho **reprocessamento** como final alternativo, e é
   ali que a cobrança dupla fica visível.
5. Registra a ausência de idempotência como nota `risk` na caixa certa.
6. Não recomenda arquitetura nova ("use outbox", "use chave de idempotência")
   como se fosse decisão de modelagem — no máximo levanta o trade-off.
