# A jornada — as sete etapas, e como elas ficam visíveis

Um arquiteto que não sabe em que etapa está não sabe se o que ele acabou de
responder era a última pergunta ou a primeira de vinte. O sintoma é conhecido:
a conversa parece um interrogatório sem fim, e depois o modelo começa a ser
escrito sem que ninguém tenha dito que a entrevista acabou.

Este arquivo define **as etapas, o que termina cada uma, e o que é dito em voz
alta**. Ele não é um formulário: quantas perguntas cabem em cada etapa é assunto
de `calibragem.md`, e a maioria das modelagens atravessa as sete em poucas
rodadas.

## As sete etapas

| id | etapa | responde | produz | quem conduz |
|---|---|---|---|---|
| `enquadramento` | Enquadramento | que decisão isto apoia, para quem, até onde | `purpose`, `audiences`, `scope` iniciais | `cfour:descoberta` |
| `calibragem` | Calibragem | qual o tamanho real desta iniciativa | `complexity` (perfil + justificativa) | `cfour:descoberta` |
| `descoberta` | Descoberta arquitetural | o que existe: sistemas, atores, limites, dados, integrações | contexto preenchido + `technical_coverage` | `cfour:descoberta`, `cfour:entrevista` |
| `estrategia` | Estratégia de modelagem | como organizar: modelagens, projetos, taxonomia, visões, ondas | recomendação + alternativa + plano de ondas | `cfour:estrategia` |
| `confirmacao` | Confirmação | o entendimento está certo? a organização vale? | `MD-NNN` `accepted`, `strategy.status: validated` | `cfour:estrategia` |
| `escrita` | Modelagem incremental | o que já é fato vira arquivo, onda a onda | YAML validado pelo `cfour check` | `cfour:entrevista` + `cfour:editor` |
| `encerramento` | Revisão e encerramento | o que ficou de pé, o que ficou pendente | revisão, memória, próximo recorte | `cfour:revisao`, `cfour:encerrar` |

As etapas são uma **ordem de dependência**, não um trilho: uma resposta na
escrita pode reabrir a descoberta, e uma descoberta grande recalibra o perfil.
Voltar é normal — voltar **sem dizer** é que não é.

## O que termina cada etapa

Cada etapa tem uma condição de saída verificável. É ela que impede o loop.

| etapa | termina quando |
|---|---|
| `enquadramento` | há uma decisão ou conversa nomeada (ou `decision: onboarding` explícito), pelo menos uma audiência e uma fronteira inicial — ainda que como hipótese |
| `calibragem` | o perfil está escolhido e **justificado pelas evidências**, e gravado |
| `descoberta` | nenhuma área **relevante** da matriz de cobertura está `unknown` em silêncio, e as perguntas que restam foram registradas como `Q-NNN` em vez de perguntadas de novo |
| `estrategia` | existe uma recomendação com alternativa, justificativa, critério de revisão e um plano de ondas |
| `confirmacao` | o arquiteto disse sim, disse não, ou disse "decida você" — e a decisão foi gravada com o que foi dito |
| `escrita` | a onda corrente atingiu seu critério de conclusão e o `cfour check` passou |
| `encerramento` | memória atualizada, pendências declaradas, próximo recorte nomeado |

**Nenhuma etapa termina por cansaço.** Se você não consegue dizer qual condição
foi satisfeita, a etapa não acabou — e se a condição não puder ser satisfeita
hoje, registre a lacuna e siga mesmo assim, dizendo o que ficou aberto. Parar de
progredir esperando uma resposta que não vem é o outro modo de falhar.

## Como a progressão fica visível

Três momentos, e nenhum deles é um relatório.

### 1. Na abertura — o mapa, proporcional ao perfil

Uma frase, antes da segunda pergunta. Não prometa etapas que este caso não vai
ter:

> Perfil leve: *"São quatro passos: entender para que serve, mapear o essencial,
> eu proponho a organização, e aí escrevo os YAMLs."*

> Perfil profundo: *"Vamos por sete etapas. Agora estamos no enquadramento;
> depois eu dimensiono a iniciativa, faço a descoberta por temas, proponho a
> organização com as alternativas, você valida, e só então começo a escrever —
> em ondas, com validação a cada uma."*

### 2. Ao entrar numa etapa — uma linha

Nome, objetivo em uma frase, e o que vai sair dali:

> *"Entrando na descoberta arquitetural: quero saber o que existe hoje —
> sistemas, quem usa, o que atravessa a fronteira. Sai daqui a lista do que vai
> virar caixa."*

### 3. Ao sair — síntese curta e a próxima

O que sabemos · o que supomos · o que falta, e o nome da próxima etapa. Três
linhas bastam. **Não peça validação aqui**, exceto nos checkpoints abaixo.

## Os cinco checkpoints

Confirmação explícita custa atenção do arquiteto, e atenção gasta em detalhe não
sobra para o que importa. Pare e espere resposta em **cinco** pontos, e em
nenhum outro:

1. **o objetivo** — o que a modelagem precisa apoiar (fim do `enquadramento`);
2. **a fronteira** — o que está dentro e o que fica fora (fim da `descoberta`);
3. **a organização** — modelagens, projetos, recorte inicial (`confirmacao`);
4. **a entrada na escrita** — "vou começar a escrever isto; confirma?";
5. **o irreversível** — `cfour push`, remover elemento, renomear `id`, apagar
   arquivo.

**Quantas paradas isso vira é do perfil** (`calibragem.md`). São cinco assuntos,
não cinco esperas: em perfil `leve`, **os quatro primeiros acontecem numa rodada
só** — o objetivo, a fronteira, a organização e o "vou começar a escrever" na
mesma mensagem, cada um nomeado, uma resposta do arquiteto para todos. Em
`intermediario` fundem-se 3 e 4; em `profundo`, os cinco são separados.

Fundir não é omitir. A fronteira que entrou na rodada continua **dita em voz
alta** — o que se economiza é o turno de espera, e é ele que custa caro em uma
iniciativa pequena.

Fora deles, **proponha e siga**, deixando o registro para trás: o arquiteto
corrige lendo, e corrigir uma linha é mais barato do que responder a uma pergunta
que ele não precisava ter recebido.

## As ondas da escrita

A etapa `escrita` não é um bloco. Ela é uma sequência de **ondas**, e a
quantidade sai do perfil (`calibragem.md`):

| onda típica | conteúdo | critério de conclusão |
|---|---|---|
| 1 | contexto: pessoas, sistemas, o que atravessa a fronteira, o primeiro diagrama | o desenho de topo responde à pergunta da audiência principal |
| 2 | containers: aplicações, bancos, filas, integrações, os diagramas de container | cada sistema relevante abre, e nenhuma integração conhecida ficou sem seta |
| 3 | o que a decisão exige: componentes, fluxos, recortes especializados | a decisão nomeada no enquadramento pode ser discutida com o que está desenhado |

Cada onda: objetivo declarado, `cfour check` ao fim, e o desenho mostrado quando
o viewer estiver aberto. **Corrigir entre ondas é mais barato que corrigir no
fim** — é essa a razão de existirem ondas, e não um mutirão só.

Perfil leve costuma ter uma onda e meia; perfil profundo, uma por recorte.

## Onde a etapa fica gravada

Em `$MEM/session.yaml`, no bloco `workflow:`:

```yaml
workflow:
  current_stage: estrategia
  completed_stages: [enquadramento, calibragem, descoberta]
  next_stage: confirmacao
  modeling_wave: 0            # 0 = ainda nao entrou na escrita
```

Sem esse bloco — memória escrita por uma versão anterior — a etapa é
**inferida** pelo que existe: sem `purpose`, é `enquadramento`; com propósito e
sem decisão estrutural, é `descoberta` ou `estrategia`; com `MD-NNN` aceita e
modelo vazio, é `confirmacao` cumprida e `escrita` por começar. Infira, **diga
que inferiu**, e grave o bloco na primeira escrita — nunca reinicie a jornada
por falta do campo.

## O que nunca fazer aqui

- Anunciar etapa a cada resposta. O anúncio é por **etapa**, não por rodada.
- Pedir confirmação fora dos cinco checkpoints.
- Entrar na `escrita` sem uma estratégia mínima validada — é o checkpoint 4, e é
  o único que protege o modelo de nascer de um palpite.
- Ficar na `descoberta` porque sempre há mais uma pergunta possível. A condição
  de saída é cobertura do que **muda o desenho**, não onisciência.
- Recomeçar de `enquadramento` numa retomada quando a memória já responde
  (`cfour:retomar`).
