---
name: descoberta
description: Descobre o propósito de uma modelagem arquitetural antes de propor qualquer estrutura — que decisão os diagramas apoiam, para quem, com que escopo, perspectiva, horizonte e granularidade. Use ao começar a modelar um sistema, iniciativa ou arquitetura no cfourdev, quando o objetivo da modelagem ainda não estiver registrado, ou quando aparecer um rótulo como plataforma, legado, componentização ou migração.
---

# Descoberta da intenção da modelagem

Descubra **para que serve** este modelo antes de decidir qualquer coisa sobre ele.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md` (método e guarda-corpos). Esta
skill não escreve YAML de modelo: ela produz `$MEM/project-context.yaml`.

## Quando NÃO usar

- O propósito já está registrado e o assunto é preencher o modelo →
  `cfour:entrevista`.
- O propósito está registrado e falta decidir organização e visões →
  `cfour:estrategia`.
- Voltando a um trabalho anterior → `cfour:retomar` primeiro.

## Passo 0 — em qual modelagem

**Antes das catorze perguntas, saiba onde a resposta vai ser gravada.** Uma
descoberta gravada na modelagem errada sobrescreve o propósito de outra
realidade, em silêncio.

**Se a ordem de resolução do núcleo já respondeu, ela vence e não se pergunta.**
O arquiteto disse o id nesta conversa, ou `C4_MODELAGEM` está definida: nos dois
casos a resposta existe, e repetir a pergunta é ignorar o que ele já disse.
**Anuncie em voz alta** — *"trabalhando em `<id>`, que veio de `C4_MODELAGEM`"* —
e siga. O anúncio é o que dá a ele a chance de corrigir sem que você decida por
ele.

O resto desta seção vale quando nada foi dito nesta conversa e a variável não
está definida. **O `active:` do `cfour.yaml` não conta aqui**, e esta é a única
skill em que ele não conta: ele é o default de quem vai *ler*, e uma descoberta
*escreve* o propósito. Herdar o `active:` em silêncio é exatamente como um
propósito novo sobrescreve o de outra realidade. Leia `cfour.yaml`:

- **Nenhuma modelagem registrada** → esta descoberta é a primeira. Siga, e crie a
  modelagem via `cfour:modelagens` quando o `id` ficar claro — o nome nasce do
  assunto, não o contrário.
- **Uma só** → é ela. Anuncie e siga.
- **Mais de uma** → **pergunte**: isto continua uma das que existem, ou é outra
  realidade? Se a resposta não for imediata, aplique
  `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/modelagem-ou-projeto.md` — e note que a
  pergunta decisiva ("o que vai precisar atravessar?") é ela mesma uma pergunta
  de descoberta, não um desvio.

Se o `project-context.yaml` da modelagem escolhida **já tiver `purpose`
preenchido**, isto não é uma descoberta nova: ou é `cfour:entrevista`,
ou é uma realidade diferente que precisa de modelagem própria. Não sobrescreva.

## A primeira pergunta

Não pergunte de que tipo é o projeto. Pergunte:

> **Que decisão ou conversa essa modelagem precisa apoiar?**

Se a resposta for "documentar a arquitetura", ainda não é resposta. Insista uma
vez, com jeito:

> Documentar para quem ler quando? Tem alguma conversa concreta chegando — uma
> revisão, uma dúvida recorrente, uma decisão travada — que esses desenhos
> precisariam destravar?

Um modelo sem decisão a apoiar é possível (onboarding, por exemplo), mas isso
**muda tudo** sobre granularidade e visões. Registre como `purpose.decision:
onboarding` e siga, em vez de fingir que existe uma decisão.

## Como conduzir

**Poucas perguntas por vez — no máximo três.** Interrogatório mata a conversa, e
uma boa resposta costuma reordenar as perguntas seguintes.

Depois de cada resposta:

1. **Devolva o que entendeu**, curto, com as palavras dele.
2. **Marque o estado epistêmico** — `FATO` (ele afirmou), `HIPÓTESE` (você
   inferiu), `PERGUNTA` (ninguém sabe).
3. **Grave** em `$MEM/project-context.yaml`. Não acumule na conversa: se a
   sessão cair, a descoberta se perde.

Quando reconhecer um padrão conhecido, traga-o como **hipótese com refutação**,
nunca como classificação → `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/labels-are-not-strategies.md` no núcleo.

Quando um sinal aparecer e você não souber o que perguntar →
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/heuristics.md`.

## As seis dimensões

Independentes: não são uma escada, e a conversa vai pular entre elas. Cubra
todas antes de fechar, ainda que a resposta seja `unknown`.

### 1. Propósito
Que problema a modelagem resolve · que decisão ela suporta · que discussão ela
facilita · que risco ela torna visível.

### 2. Audiência
Quem lê · qual profundidade técnica · o que essa pessoa precisa responder · **o
que seria ruído para ela**. Duas audiências com necessidades diferentes é sinal de
duas visões, não de uma visão maior.

### 3. Escopo
O que está dentro · o que está fora · o que aparece só como contexto · **quais
fronteiras ainda estão em discussão**. Fronteira indecisa não vira hierarquia:
vira pergunta registrada.

### 4. Perspectiva
Estrutura, comportamento, dados, segurança, integração, dependência, ownership,
implantação, operação, evolução, risco, jornada, transformação.

**Perspectiva não é nível C4.** Uma perspectiva de dados ou de segurança atravessa
contexto, container e componente ao mesmo tempo.

Pergunta obrigatória desta dimensão, porque o modelo tem duas espécies de visão:

> **Que casos de uso essa modelagem precisa contar — e o que acontece quando eles
> dão errado?**

Se houver história a contar, ela é matéria de **fluxo** (`doc:fluxos`), e os finais
ruins costumam ser o motivo pelo qual alguém pediu o desenho.

### 5. Tempo
Existe mais de um horizonte — existente, temporário, proposto, alvo, alternativo,
descontinuado? **Não presuma que existe.** E se existir, descubra se cada um apoia
uma decisão **diferente**; se apoiam a mesma, uma visão serve melhor que três.

### 6. Granularidade
Que nível de detalhe responde à pergunta. Não decomponha porque dá para
decompor; não fique no alto quando a decisão depende de responsabilidades
internas. Detalhe é uma afirmação sobre o que importa.

## Estado de conhecimento

Descubra também **o que já existe**: diagramas antigos, ADRs, planilhas, código,
uma modelagem anterior. E o que ninguém sabe — as áreas onde a resposta vai ser
"precisamos perguntar para o time X" são material de `Q-NNN`, não de silêncio.

Se a modelagem já tiver modelo, rode
`cfour check --modelagem <id> --inventory --json` antes de perguntar
qualquer coisa: perguntar o que o arquivo já responde queima a paciência do
arquiteto.

Modelo **de outra modelagem** não conta como "o que já existe" aqui. Ele pode
inspirar uma pergunta ("na Acme isso era um serviço só — aqui também?"), nunca
uma resposta.

## Portão de saída

A descoberta termina quando `$MEM/project-context.yaml` responde — ou
marca explicitamente como `unknown` — as catorze:

1. qual é o objeto sendo modelado
2. por que ele está sendo modelado
3. quais decisões precisam ser tomadas
4. quem utilizará os diagramas
5. quais perguntas cada audiência precisa responder
6. quais fronteiras já são conhecidas
7. quais fronteiras estão em discussão
8. qual é o estado de conhecimento atual
9. quais perspectivas temporais existem
10. qual granularidade é útil agora
11. quais informações são fatos
12. quais são hipóteses ou inferências
13. quais riscos precisam permanecer visíveis
14. o que fica fora do escopo

Feche apresentando um resumo em três blocos — **o que sabemos · o que supomos ·
o que precisamos descobrir** — e a recomendação do próximo passo (quase sempre
`cfour:estrategia`). Atualize `$MEM/session.yaml` com `focus` e
`next_step`.

## O que nunca fazer aqui

- Propor pastas, projetos, hierarquia, taxonomia ou visões. **Nada de estrutura
  na descoberta** — nem "só para ilustrar".
- Classificar a iniciativa por um rótulo e derivar consequências disso.
- Apresentar inferência sua com a mesma cara de coisa que o arquiteto afirmou.
- Perguntar as catorze de uma vez.
- Gravar sem ter feito o passo 0. Escrever propósito na modelagem errada é o
  único erro desta skill que a próxima sessão não consegue perceber.
