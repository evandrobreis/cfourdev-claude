# 09 — Componentização para plataforma unificada  *(teste de aceitação)*

## Briefing

> Uma organização quer construir uma **plataforma unificada** para extrair
> progressivamente capacidades que hoje estão duplicadas em vários softwares
> legados. Quero **componentizar** essas capacidades. Pode montar a modelagem?

O briefing termina aqui, de propósito. É tudo o que o harness recebe de início.

## Respostas preparadas

Responda **apenas ao que for perguntado**. Se o harness propuser estrutura sem
perguntar, o cenário já falhou.

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "convencer o comitê a financiar a primeira extração. E decidir qual capacidade sai primeiro" |
| quem lê? | "o comitê de investimento, e depois os times que vão construir" |
| o que é 'componente' aqui? | "ainda estamos discutindo. Uns dizem que é serviço com deploy próprio, outros dizem que é biblioteca compartilhada" |
| quantos legados? | "sete no total, mas só três têm a capacidade que interessa agora" |
| que capacidade? | "cálculo de comissão. Os três fazem, com regras diferentes" |
| as regras são iguais? | "não. E ninguém sabe se as diferenças são exigência de negócio ou herança" |
| quem vai ser dono da plataforma? | "não está definido. É parte do que o comitê precisa decidir" |
| quem consome? | "os três legados, no começo. Depois, produtos novos" |
| coexistência? | "sim, os legados continuam existindo por anos" |
| deploy próprio? | "não sabemos ainda" |
| vai ter roteador/adaptador? | "não sei, você que sabe. É o que a gente precisa decidir" |
| horizonte de tempo? | "primeira extração em nove meses" |

## Armadilhas — o núcleo do teste

O harness **não pode** decidir de saída:

- quantos projetos haverá;
- quais sistemas existirão;
- se haverá adaptadores;
- se haverá um roteador;
- se o padrão será strangler;
- se serão necessárias visões atual, alvo e transição;
- se cada legado terá um projeto;
- quais metadados serão usados.

## Critérios específicos

1. **Investiga antes de propor**, e cobre pelo menos: que problema a plataforma
   resolve · o que "componente" significa aqui · se as capacidades terão deploy
   próprio · quem responde por elas · quem as consome · que decisões o modelo
   apoia · quais legados são relevantes · como será a coexistência · qual a
   audiência · que riscos precisam ser comunicados · se há necessidade real de
   perspectivas temporais separadas.
2. Registra "componente" no glossário **como termo em disputa**, com as duas
   leituras — e mostra que a estratégia muda conforme a resposta.
3. Trata "as regras são diferentes" como o achado central (sinal 7): pode ser uma
   capacidade ou três, e isso muda tudo.
4. Trata ownership indefinido como risco arquitetural, não como campo em branco.
5. Reconhece duas audiências (comitê × times) com perguntas diferentes.
6. Só então propõe estratégia — com alternativas e critério de revisão.
7. Nenhuma regra específica de componentização vaza para o núcleo do harness: o
   que foi usado aqui são os sinais e os guarda-corpos gerais.

## Comparação obrigatória

Junto com o cenário **01**: mesmo vocabulário ("plataforma", "componentizar"),
necessidades opostas. As estratégias precisam sair **diferentes**, com a diferença
justificada por escala, ownership, audiência e coexistência.
