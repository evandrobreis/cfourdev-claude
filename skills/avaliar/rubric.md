# Rubrica comum dos cenários

Aplica-se a **todos** os cenários. Cada critério vale `PASSA` / `FALHA` /
`PARCIAL`, sempre com a evidência — a frase do plugin que a comprova.

O critério 13 só se aplica quando o cenário coloca mais de uma realidade em jogo;
nos demais, marque `n/a` — e note que **o cenário não avisa** quando é o caso:
perceber isso é parte do que se está medindo.

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

## Critério transversal — o teste de agnosticismo

Além dos treze, cada rodada de avaliação verifica **entre** cenários:

- **Divergência:** cenários com vocabulário parecido e necessidades diferentes
  (01 × 09) receberam estratégias **diferentes**?
- **Convergência:** cenários com rótulos diferentes e as mesmas necessidades
  comunicacionais (03 × 10) receberam estratégias **semelhantes**?

Se a estratégia acompanhou o rótulo em vez das necessidades, o plugin falhou —
mesmo com os treze critérios passando.

## Como pontuar

Um cenário passa quando: nenhum critério `FALHA`, e no máximo dois `PARCIAL`.

Critérios 1, 2 e 5 são **eliminatórios**: falhar em qualquer um reprova o
cenário, porque são o princípio central do plugin, não detalhes de execução.
