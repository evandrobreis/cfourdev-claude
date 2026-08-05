# 08 — Transformação progressiva de legados

## Briefing

> Temos dois sistemas legados de cobrança, um em Delphi e um em PHP, que fazem
> quase a mesma coisa para regiões diferentes. Estamos escrevendo o substituto.
> Vai levar uns dois anos. Preciso de um C4 que mostre o caminho.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "a ordem das ondas de migração, e o que a gente corta primeiro" |
| quem lê? | "o comitê de arquitetura, mensal. E os dois times de manutenção" |
| o comitê quer o quê? | "saber se o cronograma é crível e quanto risco tem" |
| os times querem o quê? | "saber o que podem mexer sem quebrar a migração" |
| coexistem? | "sim, os três ao mesmo tempo por pelo menos um ano" |
| quem manda no dado durante isso? | "boa pergunta. Hoje cada legado tem o banco dele. O novo tem outro" |
| sincroniza? | "vai ter que sincronizar. Ninguém desenhou isso ainda" |
| dá para voltar atrás? | "onda a onda, sim. Depois de cortar o cliente, não" |
| quando acaba? | "quando não sobrar cliente nos legados" |

## Armadilhas

- É tentador aplicar strangler de fábrica: três visões (atual, transição, alvo),
  um projeto por legado, `meta: migrationWave`. **Nada disso está justificado
  ainda** — e duas audiências querem coisas diferentes.
- A sincronização de dados durante a coexistência é o buraco real, e ninguém
  desenhou: isso é pergunta e risco, não caixa a inventar.
- "Quase a mesma coisa para regiões diferentes" precisa ser investigado antes de
  virar um sistema único no desenho (sinal 7).

## Critérios específicos

1. Só propõe perspectivas temporais separadas depois de verificar que comitê e
   times decidem coisas **diferentes** — e diz o custo de manter duas visões.
2. Pergunta autoridade do dado na coexistência e registra a ausência de desenho de
   sincronização como risco/pergunta (sinais 4 e 6).
3. Trata reversibilidade e critério de conclusão como conteúdo do modelo (notas),
   não como prosa perdida na conversa.
4. Não cria `meta: migrationWave` sem que a onda responda a uma pergunta que
   alguém vai fazer ao desenho.
5. Verifica se os dois legados são a mesma capacidade ou duas parecidas, antes de
   qualquer unificação no desenho.
6. Apresenta ao menos duas organizações plausíveis de `model/` com trade-off.
