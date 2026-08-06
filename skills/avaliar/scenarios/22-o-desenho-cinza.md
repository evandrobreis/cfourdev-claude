# 22 — O desenho cinza  *(teste de classificação)*

## Preparação

Repositório de avaliação normal, sem memória. O arquiteto **nunca menciona cor,
filtro, etiqueta, metadado ou link** — e não vai mencionar, a não ser que
perguntem. Ele nunca abriu o viewer.

Este é o par do cenário 17, e a diferença é toda: **lá o arquiteto pede a cor
por nome**, e o teste é se o plugin confere a documentação antes de prometer.
Aqui ninguém pede nada, e o teste é se o plugin **pergunta**. Um recurso que só
aparece quando o usuário já sabe que ele existe não serve para quem chegou hoje.

## Briefing

> Preciso modelar a plataforma de pagamentos. São nove serviços, mantidos por
> três squads, e a bagunça é que ninguém sabe direito quem responde por qual —
> quando cai, a gente descobre no grito. Quero levar isso para a reunião de
> arquitetura do mês que vem.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "queremos redistribuir os serviços entre os squads, e ninguém consegue discutir isso sem um mapa" |
| quem lê? | "os três tech leads e o gerente de engenharia, na reunião" |
| **por quais eixos vocês localizam um serviço?** | "a gente fala por squad e por domínio — cobrança, antifraude e carteira" |
| **o que você vai querer isolar no desenho?** | "o que é de cada squad, e o que é crítico no fechamento do mês" |
| **se pudesse pintar por uma classificação só, qual?** | "squad, sem dúvida. É disso que a reunião é" |
| **tem documento por sistema?** | "tem runbook no Confluence dos cinco principais, e ADR de uns três. Tudo com link fixo" |
| tem banco/fila? | "cada serviço tem o seu Postgres, e tem um Kafka no meio" |
| o que acontece quando falha? | "a fila reprocessa, mas ninguém acompanha" |
| criticidade tem quantos valores? | "nunca formalizamos. Todo mundo diz 'crítico'" |

## Armadilhas

- **Ninguém vai puxar o assunto.** Se o plugin não perguntar, a modelagem sai
  correta e cinza, e o arquiteto leva para a reunião um desenho que não responde
  "de quem é o quê" — que é literalmente a pergunta que o fez procurar a
  ferramenta.
- **Perguntar pelo formato é errado.** "Você quer usar tags ou metadados?"
  devolve ao arquiteto o que ele veio buscar, e cai no critério 16. A pergunta é
  sobre o trabalho dele; a tradução é do plugin.
- **`squad` é colorível, e isso não basta escrever no elemento.** Sem
  `metadata: { squad: { label: Squad, color: true } }` no `workspace.yaml`, a
  chave filtra e **não** aparece em "Colorir por" — e não há aviso nenhum.
- **`criticality` não tem valores acordados.** Criá-la aqui é inventar uma
  taxonomia que ninguém sustenta; recusá-la com o motivo é o comportamento certo,
  e vira `Q-NNN` ou uma linha de "revise se".
- Runbook e ADR têm endereço fixo: são `meta` com URL, e viram link na caixa. Não
  existe campo `links:`.
- Três squads e nove serviços **não** justificam o ritual completo — o perfil
  aqui é `intermediario`, e a classificação cabe em duas rodadas.

## Critérios específicos

1. **Pergunta**, por iniciativa própria, por quais eixos a organização localiza um
   serviço — sem que o arquiteto tenha tocado no assunto.
2. Pergunta o que ele vai querer **isolar** no desenho pronto, e o que valeria a
   pena ver **por cor**.
3. Pergunta se existe documento com endereço fixo por sistema.
4. Grava o que ouviu em `classification` (`axes`, `artifacts`, `status`) no
   `project-context.yaml`, e não só na conversa.
5. **Recomenda** a tradução no formato `RECOMENDO / PORQUE / CONSIDEREI /
   REVISE SE`, no checkpoint 3 — não devolve a escolha entre `tag` e `meta`.
6. `squad` sai como chave colorível **e** é declarada em
   `$M/model/workspace.yaml` com `label` e `color: true`.
7. Os runbooks e as ADRs entram como `meta` com URL nas caixas que os têm — e o
   plugin diz que isso vira um link, sem inventar um campo `links:`.
8. **Recusa `criticality`** enquanto não houver valores acordados, com o motivo, e
   registra a pendência em vez de deixá-la sumir.
9. Não cria chave que não responda a uma pergunta dita nesta conversa.
10. A conversa continua sendo sobre a redistribuição entre squads: a
    classificação acontece a serviço dela, e não como etapa anunciada em três
    parágrafos.
