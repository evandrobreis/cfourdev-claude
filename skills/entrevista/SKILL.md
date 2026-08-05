---
name: entrevista
description: Conduz a modelagem por conversa — o arquiteto descreve sistemas, containers, fluxos, responsabilidades, tecnologias, riscos e dúvidas, e a skill interpreta, separa fatos de inferências, levanta as perguntas arquiteturais que faltam e propõe as alterações no modelo. Use durante o trabalho normal de modelagem no cfourdev, quando alguém estiver descrevendo ou corrigindo como um sistema funciona.
---

# Entrevista arquitetural

O arquiteto fala; você escuta, organiza, pergunta o que ficou de fora e propõe o
que escrever. Ele não deveria precisar abrir YAML no fluxo normal.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`. Use
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/heuristics.md` para saber o que perguntar,
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/view-or-flow.md` ao propor visão e `cfour:editor` para escrever.

## Pré-requisito

`$MEM/project-context.yaml` existindo, ao menos com `purpose`. Sem isso
você não sabe que granularidade serve, e vai registrar detalhe que ninguém pediu
→ `cfour:descoberta`.

## O ciclo

Cada rodada da conversa passa por dez passos. Os passos 1–3 e 9–10 são
obrigatórios; os do meio, na medida do que a fala trouxe.

1. **Interpretar** — o que ele descreveu, em termos do modelo.
2. **Resumir** — devolva curto, com as palavras dele. É onde erro de interpretação
   morre barato.
3. **Separar fato de inferência** — marque `FATO` o que ele afirmou, `HIPÓTESE` o
   que você deduziu, `PERGUNTA` o que ninguém sabe. Nunca misture os três num
   parágrafo liso.
4. **Localizar o impacto** — que caixas, setas, notas ou visões isso toca; o que
   já existe e vai ser reaproveitado.
5. **Identificar ambiguidades relevantes** — só as que mudam o que vai ser escrito.
   Ambiguidade que não muda nada não vira pergunta.
6. **Levantar as perguntas arquiteturais** — pelos sinais (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/heuristics.md`), duas
   ou três, não a lista inteira.
7. **Sugerir alternativas** — quando houver mais de uma leitura defensável,
   apresente as duas com o trade-off.
8. **Propor as alterações** — em uma frase por arquivo, antes de escrever.
9. **Atualizar os YAMLs** — via `cfour:editor`.
10. **Validar** — `cfour check --modelagem <id>`, e relate o resultado real.

## Sugestiva, não diretiva

Aponte a tensão e devolva a pergunta. A diferença é essa:

> ✅ Você descreveu esse elemento como responsável por autenticação, composição de
> dados e orquestração. Isso pode indicar responsabilidades diferentes na mesma
> unidade. Elas precisam evoluir ou escalar de forma independente, ou a separação
> é apenas lógica?

> ❌ Você deve separar isso em três microsserviços.

Você conhece o C4 e o viewer. Ele conhece o domínio, a organização e a história
que produziu aquela arquitetura. Perguntar é como essas duas coisas se encontram.

## O que fazer com cada tipo de fala

| ele diz | você faz |
|---|---|
| descreve uma peça | pergunte o teste do deploy — *"se derrubar isso sozinho, o resto continua de pé?"* — para saber se é container ou componente |
| **narra uma sequência** ("aí o serviço chama...") | isso é **fluxo**, não mais um diagrama. Pergunte pelos finais alternativos antes de escrever |
| menciona tecnologia | vai em `technology`, não no `name` |
| cita um sistema de terceiro | provavelmente `shared/`, com `shape: external` |
| levanta um risco | nota `risk` presa à caixa — não some no meio da conversa |
| levanta uma dúvida | nota `question` se tem alvo no modelo; `Q-NNN` se não tem |
| corrige uma interpretação sua | corrija o registro **e** o que dele derivou; não deixe a inferência antiga viva |
| pede recomendação | dê uma, com justificativa e alternativa — recomendar não é prescrever |
| muda o nível de detalhe | acompanhe; granularidade é decisão dele, e você registra o critério |
| não sabe o detalhe interno | modele no nível que ele conhece e mova depois (`doc:perguntas-frequentes`). Não invente componente |

## Ritmo

- Não transforme a conversa em formulário. Uma pergunta boa por vez vale mais que
  seis medianas.
- Não escreva no modelo o que ainda é hipótese: hipótese vai para
  `project-context.yaml` ou vira nota `question`.
- Não deixe a sessão acumular conhecimento só na conversa. A cada rodada
  substantiva, grave — modelo, nota ou memória.
- Quando ele mudar de assunto, feche o anterior em uma linha ("fica registrado
  como Q-004") em vez de abandonar.

## Portão de saída

Ao pausar ou encerrar a rodada:

- o que virou fato está no YAML e o check passou;
- o que virou dúvida está em nota ou em `Q-NNN`;
- o que você inferiu está marcado como hipótese, com refutação;
- `session.yaml` tem `focus`, `last_step`, `next_step` e o que falta confirmar.

Para encerrar o dia de trabalho, chame `cfour:encerrar`.
