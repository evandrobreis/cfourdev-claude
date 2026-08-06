# 20 — Retomada depois da estratégia  *(teste de continuidade)*

## Preparação

O repositório de avaliação tem uma modelagem `logistica` **com memória e sem
modelo**: a sessão anterior terminou logo depois da estratégia validada, antes de
escrever qualquer YAML.

`.claude/cfour/history/logistica/project-context.yaml` responde: propósito
("decidir se a roteirização vira serviço próprio"), duas audiências (o time de
entregas e o comitê), escopo, perfil `intermediario` com justificativa, cobertura
técnica com `dados` e `integracoes` como `relevant` e `seguranca` como
`not_applicable`, e um bloco `strategy` com `status: validated`: dois projetos —
`entregas` e `shared` —, convenção de id em kebab-case, três visões
recomendadas e um plano de duas ondas.

`session.yaml` tem `workflow` com `current_stage: confirmacao`,
`completed_stages: [enquadramento, calibragem, descoberta, estrategia]`,
`next_stage: escrita`, `modeling_wave: 0`, e `next_step` dizendo "escrever a onda
1: sistemas, atores e o diagrama de contexto".

Existe também uma decisão `MD-001` sobre os dois projetos, com
`status: accepted`.

## Briefing

> Voltei. Onde a gente parou?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| quer continuar de onde parou? | "quero" |
| confirma a estratégia? | "confirmo, já tínhamos fechado isso" |
| alguma coisa mudou desde então? | "não, nada" |
| que decisão isso apoia mesmo? | "está escrito lá, não vou repetir" |
| quem lê? | "está escrito lá também" |
| pode começar a escrever? | "pode" |

## Armadilhas

- **A armadilha é recomeçar.** Refazer a descoberta, ou reapresentar a estratégia
  como pauta aberta, é a falha do cenário — e é o que o arquiteto sinaliza ao
  responder "está escrito lá".
- **Reperguntar propósito e audiência** é o sintoma mais comum, e a memória
  responde às duas coisas.
- **Reabrir a organização** ("prefere dois projetos ou um?") desfaz um checkpoint
  que já custou uma sessão.
- Anunciar "vou escrever" sem dizer que está na onda 1, ou escrever a onda 3
  antes da 1, perde a progressão que a memória guardou.

## Critérios específicos

1. Diz em qual modelagem está, e **em que etapa** o trabalho parou.
2. Apresenta a estratégia validada em uma linha, como **fato decidido**, não como
   proposta.
3. Não repete nenhuma pergunta cuja resposta já está na memória.
4. Continua da etapa seguinte — a escrita, onda 1 —, não do começo.
5. Mostra o que estava em aberto (perguntas, hipóteses, áreas técnicas) sem
   transformar isso em nova rodada de entrevista.
6. Confere o modelo com o inventário e nota que ele está vazio, sem tratar isso
   como divergência.
7. Ao entrar na escrita, atualiza `modeling_wave` e anuncia a onda.
8. Se algum bloco de estado estivesse ausente, infere e **diz que inferiu** —
   nunca recomeça a jornada por causa de um campo que falta.
