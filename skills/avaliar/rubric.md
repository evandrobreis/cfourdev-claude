# Rubrica comum dos cenários

Aplica-se a **todos** os cenários. Cada critério vale `PASSA` / `FALHA` /
`PARCIAL`, sempre com a evidência — a frase do plugin que a comprova.

Dois critérios admitem `n/a`, e eles **não são o mesmo tipo de coisa**:

- o **13** é `n/a` quando o cenário coloca uma realidade só em jogo — e note que
  **o cenário não avisa** quando é o caso: perceber isso é parte do que se está
  medindo;
- o **20** é `n/a` quando a conversa terminou antes de `cfour:estrategia`. Aqui
  não há nada a perceber: é a etapa que não foi alcançada, e cobrar a recomendação
  de uma conversa que parou na descoberta seria cobrar do plugin exatamente o que
  o guarda-corpo 1 proíbe — estrutura antes da hora.

Nenhum critério pergunta se a estratégia proposta é "a certa". Não existe a
certa: existe a justificada, a alternativa oferecida e a pergunta feita.

| # | critério | passa quando | falha quando |
|---|---|---|---|
| 1 | **descobre o propósito** | pergunta que decisão ou conversa a modelagem apoia antes de qualquer proposta de estrutura | abre perguntando o tipo do projeto, ou já sugere pastas |
| 2 | **não assume a solução** | trata padrões reconhecidos como hipótese com refutação | conclui a estrutura a partir de um rótulo do briefing |
| 3 | **pergunta o que importa** | as perguntas mudam o que seria escrito; ≤3 por vez | interrogatório, ou perguntas cuja resposta não muda nada |
| 4 | **oferece alternativa** | havendo ≥2 organizações plausíveis, apresenta as duas com trade-off e deixa a escolha | escolhe em silêncio |
| 5 | **justifica** | toda recomendação traz *porque · considerei · revise se* | recomendação nua |
| 6 | **separa estados** | marca `FATO` / `HIPÓTESE` / `PERGUNTA` | apresenta inferência com a mesma cara de fato |
| 7 | **mapa ou história** | escolhe diagrama ou fluxo pela pergunta; jornada em ordem vira fluxo | empilha diagramas para contar sequência, ou cria fluxo onde a pergunta é estrutural |
| 8 | **visões úteis** | cada visão tem pergunta e audiência; recomenda explicitamente o que **não** desenhar | propõe a escada C4 inteira por hábito |
| 9 | **YAML válido** | `cfour check` sem erro no que foi escrito | erro introduzido, ou check não rodado |
| 10 | **respeita o contrato** | só campos, `shape`, `kind` e `outcome` que existem; seta escrita uma vez no nível mais fino | inventa campo, declara `level`, duplica seta por nível |
| 11 | **memória** | grava propósito, hipóteses e perguntas **na modelagem certa**, e anuncia qual é; decisão estrutural vira `MD-NNN` | termina a sessão com tudo só na conversa, ou escreve sem dizer em qual modelagem |
| 12 | **finais tristes** | ao propor fluxo, pergunta o que acontece quando dá errado | fluxo só com caminho feliz, sem justificativa |
| 13 | **modelagem ou projeto** | havendo mais de uma realidade em jogo, pergunta se é modelagem nova ou projeto na existente, e decide pelo que precisa atravessar | cria modelagem por rótulo novo, ou enfia realidades incompatíveis na mesma por inércia |
| 14 | **proporcional** | o peso do processo cabe no tamanho da iniciativa; o perfil sai das características descobertas e fica registrado com justificativa | mesmo ritual para um app de três devs e uma plataforma; ou perfil deduzido de uma palavra do briefing |
| 15 | **jornada visível** | diz em que etapa está, o que sai dela e qual é a próxima; há transição explícita entre descobrir, propor e escrever | perguntas indefinidas sem condição de saída, ou começa a escrever YAML sem anunciar |
| 16 | **recomenda, não delega** | decisão derivável vem recomendada, justificada, com a alternativa e um pedido de objeção; slug e ids são propostos | devolve a decisão ("qual você prefere?", "que slug quer?") ou bloqueia esperando escolha manual |
| 17 | **cobertura técnica** | verifica banco, mensageria, dados, integrações e o resto de forma proporcional; o que não se aplica é dito | começa a modelar deixando área relevante desconhecida sem mencionar, ou faz o arquiteto lembrá-lo |
| 18 | **documentação e fonte** | consulta a doc oficial por iniciativa própria antes de usar recurso incerto; registra a fonte; cache com origem e data | inventa campo, afirma sem conferir, apresenta cache velho como atual, ou busca fonte privada primeiro |
| 19 | **classificação — a pergunta** | percorre os eixos de `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/classificacao.md` (localizar, filtrar, colorir, linkar) **na medida do perfil**, perguntando pelo vocabulário deles e pelo que já tem endereço fixo (ADR, runbook, painel) — ou, quando a conversa termina antes de a pergunta caber, **registra-a com endereço**: qual eixo falta e em que etapa ela entra | entrega o modelo sem ninguém ter perguntado o que o leitor ia querer isolar; ou pergunta pelo formato ("você quer tag ou metadado?") em vez de pelo trabalho |
| 20 | **classificação — a recomendação** | recomenda o que vira `tag`, o que vira `meta`, o que colore (`color: true`, declarado) e o que vira link, dizendo o que ficou de fora e por quê — e **"nada vira `tag`, nada colore, e por quê" é resposta que passa**, desde que dita | cria chave que não responde pergunta nenhuma; ou escolhe uma chave colorível e não a declara, e a cor não existe na tela; ou deixa o eixo em silêncio, sem dizer que não se aplica |

O 19 e o 20 foram **um critério só** até aqui, e cobravam num lugar duas coisas
que acontecem em etapas diferentes: perguntar por eixo é de `cfour:descoberta`,
e a tradução para `tag`, `meta`, cor e link é de `cfour:estrategia` — a própria
`cfour:descoberta` diz isso em voz alta ("é recomendação, não pergunta"). Como
vários cenários terminam **antes** da estratégia, por desenho, o avaliador
procurava a recomendação, não a encontrava, e marcava `PARCIAL` citando o plugin
fazendo exatamente a coisa certa. Um cenário passa com no máximo dois `PARCIAL`:
um deles vinha de graça, e a suíte perdia metade da folga que existe para
capturar um `PARCIAL` de verdade.

O 19 aceita a pergunta **registrada com endereço** porque partir o critério em
dois não resolveria sozinho o caso que o motivou: uma conversa que para na
descoberta antes de a pergunta caber continuaria sem tê-la feito, e continuaria
levando `PARCIAL` — agora na outra metade. Registrar qual eixo falta e em que
etapa ele entra é o comportamento certo ali, e é o que o 19 passa a reconhecer.
A cobrança não afrouxa: a coluna do que reprova é sobre **entregar o modelo**, e
uma pergunta apenas registrada não sobrevive a uma entrega.

Foram consideradas e descartadas duas saídas mais baratas: admitir `n/a` no
critério inteiro, como o 13 admite — mas isso apagaria junto a cobrança da
*pergunta*, e um plugin que nunca perguntasse por eixo nenhum sairia impune em
todo cenário que parasse na descoberta; e endurecer o portão de saída da
descoberta para exigir a pergunta feita — que muda o comportamento do plugin em
vez da régua, e deixaria o `PARCIAL` da outra metade de pé.

## Critérios transversais — os testes de agnosticismo

Além dos vinte, cada rodada de avaliação verifica **entre** cenários:

- **Divergência:** cenários com vocabulário parecido e necessidades diferentes
  (01 × 09) receberam estratégias **diferentes**?
- **Convergência:** cenários com rótulos diferentes e as mesmas necessidades
  comunicacionais (03 × 10) receberam estratégias **semelhantes**?
- **Calibragem:** dois cenários que se chamam "plataforma" (01 × 09) receberam
  **perfis diferentes** — e a diferença veio de escala, ownership e audiência,
  não do vocabulário? E dois cenários com nomes diferentes (12 × 01) podem
  receber o **mesmo** perfil?

Se a estratégia — ou o peso do processo — acompanhou o rótulo em vez das
necessidades, o plugin falhou, mesmo com os vinte critérios passando.

## Como pontuar

Um cenário passa quando: nenhum critério `FALHA`, e no máximo dois `PARCIAL`.

Critérios 1, 2, 5 e 16 são **eliminatórios**: falhar em qualquer um reprova o
cenário, porque são o princípio central do plugin, não detalhes de execução. O 16
entrou na lista porque devolver ao arquiteto a decisão que ele pediu ajuda para
tomar anula o valor do resto — uma conversa impecável que termina em "e aí, como
você prefere?" não entregou nada.
