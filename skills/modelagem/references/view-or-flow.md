# Mapa ou história — como uma visão nasce

Uma visão não nasce de um nível C4. Nasce de uma **pergunta que alguém precisa
responder para decidir alguma coisa**.

> **Nível C4 nunca é justificativa suficiente para criar uma visão.**
> "Falta o diagrama de componentes" não é motivo. "Ninguém sabe onde a regra de
> preço vive, e isso trava a decisão de extrair o cálculo" é.

## Passo 1 — escreva a proposta antes do YAML

Preencha isto **em conversa**, antes de tocar em arquivo. Campo que você não
conseguir preencher é uma pergunta a fazer, não um espaço a chutar.

```yaml
viewProposal:
  question:       # a pergunta que esta visão responde, na voz de quem pergunta
  audience:       # quem vai ler, e com que profundidade técnica
  decision:       # a decisão ou conversa que ela apoia
  subject:        # do que ela fala
  scope:          # até onde vai a fronteira
  perspective:    # estrutura, comportamento, dados, segurança, ownership...
  timeHorizon:    # hoje, transição, alvo — só se houver mais de um
  requiredDetail: # a granularidade mínima que responde à pergunta
  exclusions:     # o que fica de fora de propósito
```

Duas perguntas de corte, antes de continuar:

- **Alguma visão existente já responde isso?** Então a resposta é ajustar aquela,
  não criar outra. Visão redundante custa manutenção e divide a atenção.
- **Se a resposta não mudar nenhuma decisão**, a visão não precisa existir. Diga
  isso — recomendar *não* desenhar é uma recomendação legítima.

## Passo 2 — mapa ou história

O modelo tem duas espécies de visão, com papéis declarados (`docs/01`):

```
DIAGRAMA   o mapa:      o que existe e quem conversa com quem
FLUXO      a história:  o que acontece, em que ordem — e quando dá errado
```

| a pergunta é… | vira |
|---|---|
| o que existe? quem conversa com quem? o que tem dentro de quê? | **diagrama** com `scope` |
| o que acontece quando alguém compra? em que ordem? e quando dá errado? | **fluxo** com `steps` + `paths` |
| onde estão as caixas de um domínio / time / camada? | diagrama com `include: {meta: …}` e `groupBy` |
| o que este sistema toca lá fora? | diagrama com `neighbors: 1` |
| de qual caixa estamos falando neste desenho? | `subject` na visão |
| quem ainda depende do legado? | **filtro por `tag`**, não uma visão nova |

Sinais de que o arquiteto está pedindo **história** mesmo falando em diagrama:
ele narra em ordem ("aí o serviço chama…", "quando o pagamento volta…"), usa
tempo verbal de sequência, ou pergunta o que acontece **quando falha**.

Jornada ponta a ponta, atravessando sistemas e times, é fluxo — não uma pilha de
diagramas (`docs/09`).

## Passo 3 — traduza para os recursos que existem

| a proposta pede | escreva |
|---|---|
| abrir uma caixa por dentro | `scope: <id>` (o padrão já são os filhos diretos) |
| um conjunto curado, sem moldura | visão de topo: sem `scope`, `include` listando |
| um recorte transversal | `include: { meta: {…} }` ou `{ tag: … }` |
| garantir que só um nível entre | `where: { level: … }` |
| tirar o que polui | `exclude` |
| contexto de vizinhança | `neighbors: 1` (`2` quase sempre é demais) |
| organizar o que já entrou | `groupBy:` ou `groups:` |
| dizer do que se fala | `subject:` |
| a sequência | `steps:`, com `participants` fixando a espinha |
| o que muda quando dá errado | `paths:` com `from` no passo do desvio |

Restrições que mudam o desenho da proposta: não há negação em seletores; filtro
escurece mas não esconde; banda não traz ninguém novo; fluxo não tem `alt`/`loop`;
a caixa do `scope` não aparece dentro do próprio diagrama.

## Passo 4 — as duas perguntas de qualidade

**Quantas caixas?** Uma visão de contexto com mais de ~15 caixas virou outra
coisa. Se a contagem explodiu, o problema costuma ser a pergunta: ela está
juntando duas.

**O fluxo tem final triste?** Um fluxo só com caminho feliz é um caso de uso pela
metade. Os finais ruins — pagamento recusado, estoque zerado, o serviço externo
fora do ar — costumam ser exatamente o motivo pelo qual alguém pediu o desenho.
Se o arquiteto não mencionou nenhum, pergunte antes de escrever.

## Passo 5 — só então o arquivo

Escreva a visão com `cfour:editor` e rode `cfour check`.

Registre a proposta que a originou: a `question` e a `audience` viram uma nota
`info` presa ao diagrama, ou uma linha na decisão de modelagem correspondente.
Uma visão cuja pergunta ninguém mais lembra é a primeira a apodrecer.
