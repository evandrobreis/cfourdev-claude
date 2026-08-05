# 03 — Ecossistema de microsserviços

## Briefing

> Temos uns quarenta serviços, seis times. Ninguém tem o mapa. Toda release
> quebra alguma coisa em outro time e a gente descobre em produção. Preciso de um
> C4 para achar onde está o acoplamento.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "decidir onde investir para as releases pararem de se atropelar" |
| quem lê? | "os staff engineers e os seis tech leads" |
| todos os 40 importam? | "não. Uns oito estão no meio de tudo, o resto é folha" |
| tem inventário? | "tem uma planilha com serviço, time e repositório. Está mais ou menos atualizada" |
| como conversam? | "REST quase tudo, e uns dez consomem eventos de um Kafka" |
| onde dói mais? | "checkout e catálogo. Quando o catálogo muda contrato, três times param" |
| dono? | "cada serviço tem um time dono, isso está claro" |
| tem jornada crítica? | "compra: passa por seis serviços de quatro times" |

## Armadilhas

- Modelar os quarenta com o mesmo detalhe produz um desenho ilegível que responde
  nada. A pergunta é sobre acoplamento, não sobre inventário.
- A planilha já traz `owner` — é taxonomia com pergunta real, e vem de graça.
- "Quando o catálogo muda contrato, três times param" é comportamento: pede
  **fluxo**, não mais um diagrama.

## Critérios específicos

1. Corta escopo pela pergunta: os oito serviços centrais e as bordas, não os 40.
2. Propõe `meta: { owner: ... }` e `groupBy` por time — porque responde "de quem é
   o que quebra", não porque é bonito.
3. Reconhece a jornada de compra como fluxo e pergunta onde ela costuma falhar.
4. Levanta contrato, versionamento e propagação de falha (sinais 2 e 3).
5. Não propõe uma visão por serviço.
6. Aproveita a planilha existente em vez de recomeçar o inventário.

## Comparação obrigatória

Junto com o cenário **10**: rótulos diferentes ("microsserviços" × "jornada"),
necessidades comunicacionais parecidas — ownership explícito e fluxo sobre a
estrutura existente. As estratégias devem **convergir**, e a convergência precisa
estar justificada pelas necessidades, não por coincidência.
