---
name: encerrar
description: Encerra uma sessão de modelagem arquitetural no cfourdev — consolida o que virou fato, registra decisões, hipóteses e perguntas abertas, grava um resumo cronológico e atualiza o próximo foco. Use ao terminar o trabalho de modelagem do dia, antes de fechar o repositório, ou quando pedirem /cfour:encerrar.
---

# Encerrar a sessão

O objetivo é que a próxima sessão — ou outra pessoa — consiga retomar sem você.
Isso não se consegue guardando a conversa: se consegue guardando **o que a
conversa produziu**.

## Procedimento

### 1. Resumir os aprendizados

O que esta sessão descobriu que não se sabia antes. Uma lista curta, em conversa,
para o arquiteto confirmar antes de virar arquivo.

### 2. Promover o que virou fato

Informação que deixou de ser hipótese vai para o **YAML do modelo** — e **sai** do
`project-context.yaml`. Deixar nos dois lugares cria duas verdades que divergem na
semana seguinte.

Escreva via `cfour:editor` e rode `cfour check --modelagem <id>`.

### 3. Consolidar decisões

Cada escolha estrutural aceita hoje vira ou atualiza um
`$MEM/decisions/MD-NNN-*.md`:

- `proposed` que o arquiteto aceitou → `accepted`;
- decisão que deixou de valer → `superseded`, apontando a substituta. **Nunca
  reescreva a antiga como se sempre tivesse sido outra.**

### 4. Registrar hipóteses

- novas → `H-NNN` com `basis` e `refuted_by`;
- confirmadas → marcadas e removidas do contexto (já viraram YAML);
- refutadas → **permanecem**, marcadas `refuted`. Saber o que foi descartado evita
  redescobrir a mesma ideia em três meses.

### 5. Registrar perguntas abertas

`Q-NNN` com o que cada uma bloqueia. Pergunta respondida hoje sai da lista —
virou fato ou hipótese. Pergunta com alvo no modelo pertence a uma **nota**
`question` na caixa, não à lista.

### 6. Atualizar o próximo foco

`$MEM/session.yaml`: `focus`, `last_step`, `next_step`,
`pending_confirmations`, `touched_files`, e o `model_fingerprint` com as contagens
de `cfour check --modelagem <id> --inventory --json` — **desta** modelagem.
Um fingerprint tirado com `--all`, ou de outra raiz, garante uma divergência falsa
na próxima retomada.

`next_step` precisa ser acionável: "escrever o fluxo de conciliação e perguntar ao
time de finanças o que acontece quando a captura não bate" é próximo passo;
"continuar a modelagem" não é.

### 7. Gravar o resumo cronológico

`$MEM/sessions/AAAA-MM-DD-<assunto>.md`, no formato de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/templates/session-summary.md`.

**Resumo estruturado, nunca transcrição.** Ninguém relê transcrição, e o que
importa fica enterrado nela.

### 8. Validar a coerência

Última passada, antes de fechar:

- `cfour check --modelagem <id>` sem erro novo;
- nada duplicado entre modelo e memória;
- toda decisão `accepted` tem consequência visível no modelo — ou uma linha
  dizendo por que ainda não tem;
- `next_step` do `session.yaml` bate com o "próximo foco" do resumo;
- tudo que foi escrito hoje está **na mesma modelagem** que você anunciou ao
  abrir a sessão.

Relate o que ficou pendente. Encerrar com pendência declarada é honesto; encerrar
dizendo que está tudo fechado quando não está é o único desfecho ruim.
