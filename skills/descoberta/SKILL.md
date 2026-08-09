---
name: descoberta
description: Descobre o propósito de uma modelagem arquitetural antes de propor qualquer estrutura — que decisão os diagramas apoiam, para quem, com que escopo, perspectiva, horizonte e granularidade. Use ao começar a modelar um sistema, iniciativa ou arquitetura no cfourdev, quando o objetivo da modelagem ainda não estiver registrado, ou quando aparecer um rótulo como plataforma, legado, componentização ou migração.
---

# Descoberta da intenção da modelagem

Descubra **para que serve** este modelo antes de decidir qualquer coisa sobre ele.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md` (método e guarda-corpos). Esta
skill não escreve YAML de modelo: ela produz `$MEM/project-context.yaml`.

## As três etapas que esta skill conduz

Ela cobre as três primeiras da jornada
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/jornada.md`), e **anuncia cada uma**:

| etapa | responde | termina quando |
|---|---|---|
| `enquadramento` | que decisão isto apoia, para quem, até onde | há decisão nomeada, uma audiência e uma fronteira inicial |
| `calibragem` | qual o tamanho real desta iniciativa | o perfil está escolhido, justificado e gravado |
| `descoberta` | o que existe: sistemas, atores, limites, dados, integrações | nenhuma área **relevante** da cobertura técnica ficou `unknown` em silêncio |

Na primeira ou segunda resposta, dê o mapa em **uma frase**, do tamanho do
perfil:

> Vamos por quatro passos: entender para que serve, mapear o essencial, eu
> proponho a organização, e aí escrevo os YAMLs.

O arquiteto que sabe quantos passos faltam responde melhor do que o que acha que
o interrogatório não acaba nunca.

O mapa vem **antes** de a calibragem terminar, então o perfil ainda é palpite:
comece pelo curto, o de quatro passos acima. Prometer sete etapas a quem pediu
uma coisa pequena espanta; descobrir no meio que o caso é grande se corrige com
uma frase — *"isto é maior do que parecia, vou por temas"* —, e recalibrar em voz
alta já é o que a calibragem manda fazer.

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

## Calibrar, antes de aprofundar

Assim que o enquadramento der o mínimo — o que é, para que serve, para quem —,
**dimensione a iniciativa** e siga no ritmo que ela pede
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/calibragem.md`). Isto acontece cedo de propósito: é o
que decide se o resto da descoberta cabe em duas perguntas ou pede rodadas
temáticas.

- classifique pelas **características descobertas**, nunca por uma palavra do
  briefing. "Plataforma" não é perfil profundo, e nada impede que duas
  iniciativas com esse nome recebam perfis opostos;
- não faça um questionário para calibrar. Use o que já foi dito, e o que o
  repositório mostra;
- **não pergunte qual perfil ele quer.** Escolha, diga em uma linha por quê, e
  siga. Ele corrige se quiser mais leve ou mais fundo, e isso vence;
- grave em `complexity` (perfil, justificativa, evidências) no
  `$MEM/project-context.yaml`.

> Pelo que você descreveu — uma API, um front, um Postgres e um time só — vou
> trabalhar leve aqui: duas ou três perguntas e já parto para a organização. Se
> aparecer algo maior no caminho, eu aprofundo.

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

Independentes: não são uma escada, e a conversa vai pular entre elas. Percorra
todas antes de fechar — **o que se grava** de cada uma é assunto do portão de
saída, no fim desta skill, e a forma do registro é do perfil.

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

## A cobertura técnica

As seis dimensões acima dizem **para que** o modelo serve. Elas não dizem o que
existe — e é aí que o arquiteto acaba tendo de lembrar o plugin do banco, da fila
ou da plataforma de dados que para ele eram óbvios.

Percorra as sete áreas de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/cobertura-tecnica.md` — estrutura funcional, aplicações,
dados, integrações, infraestrutura, segurança, operação — **na medida do perfil**:

- **leve:** uma pergunta agrupada resolve quase tudo.

  > Além da aplicação principal, existe banco, fila, cache, serviço externo ou
  > algo rodando em background que precise aparecer?

- **intermediário:** agrupe por proximidade — dados e integrações numa rodada,
  aplicações e operação em outra;
- **profundo:** uma rodada temática por área que importa, anunciada pelo nome.

Antes de perguntar, **leia o repositório**: `docker-compose.yml`, manifests,
Terraform, `package.json`, `migrations/`, README. O que vier de lá é **evidência
observada**, não fato — e se apresenta assim:

> ✅ "Encontrei manifests de PostgreSQL e Redis. Isso sugere que os dois fazem
> parte da solução; ainda não sei se pertencem a este recorte."

> ❌ "A arquitetura usa PostgreSQL e Redis, e ambos serão modelados."

Cada área termina com um `status` gravado em `technical_coverage` —
`relevant`, `not_applicable`, `unknown` ou `deferred`. **Área que não se aplica
se registra; não se omite.**

## Como eles localizam uma coisa, e o que já tem endereço

A cobertura técnica garante que nada **existe** em silêncio. Falta a outra
metade: o que o leitor vai conseguir **fazer** com o desenho — isolar, agrupar,
enxergar por cor, e sair da caixa para o documento que a explica.

Percorra os quatro eixos de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/classificacao.md` — localizar,
filtrar, colorir, linkar — **na medida do perfil**. Com perfil `leve`, uma
pergunta agrupada resolve:

> Quando o desenho estiver pronto, o que você vai querer distinguir nele — por
> time, por domínio, por criticidade? E tem documento por sistema (ADR, runbook,
> painel) que valha deixar a um clique da caixa?

**Pergunte pelo vocabulário deles, nunca pelo formato.** "Por quais eixos vocês
localizam um serviço aqui" é uma pergunta sobre o trabalho dele; "você quer tags
ou metadados?" é devolver a ele o que ele veio buscar. A tradução para `tag`,
`meta`, cor e link é da estratégia, e é recomendação — não pergunta.

O resultado vai para `classification` em `$MEM/project-context.yaml`, com os
mesmos quatro `status` da cobertura técnica. **Eixo que não se aplica se
registra; não se omite** — um desenho cinza de propósito é uma escolha, e só é
escolha se alguém a tiver feito.

## Estado de conhecimento

Descubra também **o que já existe**: diagramas antigos, ADRs, planilhas, código,
uma modelagem anterior. E o que ninguém sabe — as áreas onde a resposta vai ser
"precisamos perguntar para o time X" são material de `Q-NNN`, não de silêncio.

O que tiver **endereço fixo** não fica só na conversa: é candidato a `meta` com
URL, que vira um link na caixa. Ver o eixo `linkar` de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/classificacao.md`.

Se a modelagem já tiver modelo, rode
`cfour check --modelagem <id> --inventory --json` antes de perguntar
qualquer coisa: perguntar o que o arquivo já responde queima a paciência do
arquiteto.

Modelo **de outra modelagem** não conta como "o que já existe" aqui. Ele pode
inspirar uma pergunta ("na Acme isso era um serviço só — aqui também?"), nunca
uma resposta.

## Portão de saída

A descoberta termina quando `$MEM/project-context.yaml` cobre as catorze **na
forma que o perfil pede**, **e** quando a matriz de cobertura técnica não tem
área `relevant` em `unknown` sem que isso tenha sido dito em voz alta, **e**
quando a classificação foi perguntada e o que se ouviu está gravado em
`classification`.

**A profundidade das catorze é do perfil — e a forma do registro também.** É a
segunda metade que costuma ficar para trás: aliviar o *perguntar* e manter o
*escrever* produz uma conversa de três perguntas seguida de vinte e cinco campos
datilografados, e quem pediu uma coisa pequena espera do mesmo jeito.

| perfil | o que o portão cobra |
|---|---|
| `leve` | o que **foi dito** está gravado. O que não foi conversado fica **ausente** |
| `intermediario`, `profundo` | o que foi dito, **e** `unknown` explícito no resto |

A diferença entre ausência e `unknown` não é formalidade — é a substância disto:

- **`unknown` explícito é uma afirmação:** *"perguntei, e não se sabe"*. É dívida
  declarada, e vale nos perfis em que houve rodada para perguntar;
- **ausência é o estado natural de uma conversa curta.** Enchê-la de `unknown`
  produz um documento que **parece** completo e não é: a sessão seguinte lê vinte
  e cinco dívidas onde houve uma conversa de dez minutos, e não sabe distinguir o
  que ninguém sabe do que ninguém precisou.

Duas coisas **não** são do perfil, e valem em `leve` igual:

- nenhuma área técnica marcada `relevant` fica em `unknown` sem que isso tenha
  sido **dito em voz alta** ao arquiteto;
- a classificação foi **perguntada**. A resposta pode caber em meia linha, e o
  `status` sai dela; o que não pode é ninguém ter perguntado o que o leitor ia
  querer distinguir no desenho.

As catorze:

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
o que precisamos descobrir** —, as áreas técnicas que ficaram desconhecidas de
propósito, e o nome da próxima etapa (`estrategia`, quase sempre
`cfour:estrategia`). Atualize `$MEM/session.yaml` com `focus`, `next_step` e o
bloco `workflow` — `current_stage`, `completed_stages`, `next_stage` —, que é o
que permite a `cfour:retomar` voltar aqui sem repetir nada.

Este é o **checkpoint 2** da jornada, e ele tem forma por perfil, como o portão
acima. Em `intermediario` e `profundo` é parada própria: peça a validação da
fronteira, e só dela. Em `leve` ele entra na **rodada de confirmação fundida**
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/calibragem.md`), com o
objetivo, a organização e a entrada na escrita — uma parada, e não duas.

Fundir **não** é omitir: a fronteira continua nomeada em voz alta, dentro da
mesma rodada. O que se economiza é o turno de espera, não a pergunta.

## Quando a modelagem ainda não existe

Se a descoberta é a primeira e não há modelagem registrada, o `id` nasce do
assunto — e **você o propõe**, derivado do nome que já apareceu
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/decisoes-de-quem.md`), sem parar a conversa para perguntá-lo.
Criar o esqueleto é com `cfour:modelagens`.

## O que nunca fazer aqui

- Propor pastas, projetos, hierarquia, taxonomia ou visões. **Nada de estrutura
  na descoberta** — nem "só para ilustrar". Perguntar por quais eixos a
  organização já fala **não** é isto: vocabulário em uso e documento que já
  existe são fato dele, e são exatamente a matéria-prima que a estratégia precisa
  ter antes de propor uma taxonomia. O que não se faz aqui é decidir se aquilo
  vira `tag` ou `meta`.
- Classificar a iniciativa por um rótulo e derivar consequências disso — nem a
  estrutura, nem o perfil de complexidade.
- Apresentar inferência sua com a mesma cara de coisa que o arquiteto afirmou.
- Perguntar as catorze de uma vez, ou tratá-las como formulário a preencher em
  voz alta.
- Datilografar `unknown` em campo que ninguém conversou, para fechar o portão em
  perfil `leve`. O portão não é a lista preenchida: é a conversa que houve estar
  gravada.
- Continuar perguntando depois que a condição de saída foi satisfeita. Sempre há
  mais uma pergunta possível; o critério é o que **muda o desenho**.
- Fechar deixando área técnica relevante como desconhecida sem dizer. Vale igual
  para `classification`: entregar um modelo sem ninguém ter perguntado o que o
  leitor ia querer isolar é o silêncio de que ninguém reclama, porque quem nunca
  abriu o viewer não sabe que aquilo existe.
- Gravar sem ter feito o passo 0. Escrever propósito na modelagem errada é o
  único erro desta skill que a próxima sessão não consegue perceber.
