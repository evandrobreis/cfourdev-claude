# Calibragem — quanto processo esta iniciativa merece

Um método que serve para uma plataforma com nove times **sufoca** um app de três
devs. E um método que serve para o app de três devs **entrega um desenho bonito e
errado** para a plataforma. Não existe um peso certo: existe o peso proporcional
ao caso.

Este arquivo diz como medir o caso e o que muda em cada etapa
(`jornada.md`) conforme a medida.

> **O perfil é uma escolha sua, justificada — não uma pergunta ao arquiteto.**
> Ele pode pedir mais leve ou mais fundo a qualquer momento, e isso vence. Mas
> perguntar "você quer o fluxo completo ou o resumido?" antes de ter olhado a
> iniciativa é devolver ao arquiteto a única coisa que ele contratou você para
> fazer: julgar.

## Como classificar — por evidência, nunca por vocabulário

A mesma regra que vale para estratégia vale para o peso do processo
(`labels-are-not-strategies.md`): **"plataforma" não é perfil profundo e
"aplicaçãozinha" não é perfil leve.** Duas iniciativas chamadas plataforma podem
receber perfis opostos, e é isso que a suíte de avaliação mede.

Classifique pelo que você **descobriu**, olhando quinze evidências. Nenhuma
sozinha decide; o que decide é o acúmulo:

| eixo | o que aumenta o peso |
|---|---|
| sistemas e aplicações | mais de um executável com ciclo próprio |
| domínios | mais de um vocabulário de negócio na mesma conversa |
| times e ownership | mais de um dono, ou dono indefinido |
| integrações | várias, ou com terceiros que podem dizer não |
| assincronia | fila, tópico, evento, processamento em background |
| dados | mais de um armazenamento, ou dado compartilhado entre domínios |
| legado | algo que ninguém quer tocar e todo mundo depende |
| implantação | mais de um ambiente, região ou topologia que precise aparecer |
| multi-tenancy | o tenant aparece na arquitetura, não só nos dados |
| segurança e regulação | fronteira de confiança, dado sensível, exigência externa |
| federação | modelo dividido entre repositórios, empresas ou times |
| audiências | públicos com necessidades diferentes lendo os mesmos desenhos |
| decisões apoiadas | mais de uma decisão em jogo, ou decisão cara de errar |
| incerteza | fronteiras em discussão, "não sabemos ainda" recorrente |
| longevidade | o modelo vai ser mantido por anos, e não por uma reunião |

**Não produza uma nota numérica.** "Onze de quinze" é falsa precisão: os eixos
não têm o mesmo peso, e o arquiteto vai discutir o número em vez do que ele
representa. Nomeie **as três ou quatro evidências que decidiram** e siga.

## Os três perfis

### `leve`

*Quando:* uma aplicação ou sistema pequeno, poucas integrações, um time,
arquitetura sem surpresa, objetivo de documentação ou alinhamento bem delimitado.

*Como fica o processo:*

- enquadramento e calibragem numa rodada só, com no máximo três perguntas;
- descoberta técnica em **uma pergunta agrupada** (`cobertura-tecnica.md`);
- estratégia em um parágrafo: um projeto, convenção de id, duas ou três visões;
- checkpoints 1, 2, 3 e 4 fundidos numa validação só — a fronteira entra nela,
  nomeada, em vez de virar parada própria;
- **o registro também é leve**: grava-se o que foi dito, e o que não foi
  conversado fica ausente, em vez de datilografado como `unknown`. Os portões de
  saída da descoberta e da estratégia trazem a regra inteira;
- entra na escrita rápido, com uma onda e meia;
- aprofunda **quando aparecer motivo**, não por precaução.

O erro que este perfil corrige tem nome, porque foi cometido: aliviar o
**perguntar** e manter o **escrever**. Três perguntas seguidas de vinte e cinco
campos preenchidos com `unknown` não é um caminho curto — é o mesmo caminho, com
a conta paga na outra ponta.

### `intermediario`

*Quando:* mais de uma aplicação, várias integrações, algumas decisões
arquiteturais em jogo, mais de uma audiência ou equipe.

*Como fica o processo:*

- descoberta estruturada, mas ainda em conversa — três perguntas por rodada;
- levantamento técnico das áreas que mudam o desenho, as outras marcadas
  `not_applicable` explicitamente;
- estratégia explícita, com a alternativa nomeada e o plano de ondas;
- checkpoint da organização antes da escrita;
- duas a três ondas.

### `profundo`

*Quando:* plataformas, múltiplos domínios, muitos times, arquitetura
distribuída, legados coexistindo, federação entre repositórios, decisões caras.

*Como fica o processo:*

- descoberta por **rodadas temáticas**, cada uma anunciada;
- cobertura técnica completa, área por área, com o que não se aplica dito em voz
  alta;
- alternativas de organização comparadas, com o custo de cada uma;
- estratégia formal, decisão `MD-NNN` com opções consideradas;
- fases e checkpoints explícitos;
- modelagem incremental **por recorte**, uma onda por recorte.

Mesmo aqui: **agrupe perguntas.** Perfil profundo não autoriza interrogatório —
autoriza mais temas, não mais rodadas por tema.

## O que muda, em uma tabela

| | `leve` | `intermediario` | `profundo` |
|---|---|---|---|
| perguntas por rodada | até 3, agrupadas | até 3 | até 3, por tema |
| rodadas até a estratégia | 1–2 | 2–4 | 4–8, temáticas |
| cobertura técnica | 1 pergunta agrupada | áreas relevantes | todas as áreas, nomeadas |
| alternativas de organização | citada em uma linha | comparada | comparada com custo |
| decisão de modelagem | só se houver escolha real | sim | sim, com opções consideradas |
| checkpoints | 2 (1–4 fundidos, mais o 5) | 4 | 5 |
| registro na memória | o que foi dito; o resto ausente | o dito, mais `unknown` explícito | idem, área por área |
| memória além do `strategy` | `MD-NNN` curta; o resto se houver | convenções e `Q-NNN` | tudo, com fontes |
| ondas de escrita | 1–2 | 2–3 | uma por recorte |
| anúncio da jornada | uma frase | uma frase por etapa | mapa na abertura |

## Recalibrar

O perfil é uma **hipótese sobre o tamanho do trabalho**, e hipótese se revisa.

Recalibre para cima quando aparecer: um segundo domínio, um dono que ninguém
sabia que existia, uma integração com terceiro, um legado, uma exigência
regulatória, ou uma segunda audiência com necessidade oposta.

Recalibre para baixo quando o que parecia grande se revelar um sistema só com
nomes grandes.

Ao recalibrar:

1. **diga em voz alta o que mudou** — a evidência nova, não a impressão;
2. **não descarte o que já foi descoberto.** Recalibrar aprofunda o que falta;
   não reabre o que já está respondido;
3. grave a revisão em `complexity.rationale`, mantendo o perfil anterior visível
   (`previous`), porque a mudança de perfil é parte da história da modelagem;
4. se subiu de perfil depois da estratégia estar validada, a pergunta é se a
   **estratégia** ainda serve — não se a descoberta precisa recomeçar.

## Onde fica gravado

Em `$MEM/project-context.yaml`:

```yaml
complexity:
  profile: intermediario        # leve | intermediario | profundo
  rationale: |
    Tres aplicacoes com deploy proprio, dois times, uma fila entre eles e
    integracao com um gateway externo que versiona por conta propria.
  evidence: [aplicacoes, times, assincronia, integracoes]
  previous: leve                # quando houve recalibragem
  reviewed_at: AAAA-MM-DD
  status: hypothesis            # fact | hypothesis | unknown
```

Memória sem esse bloco é memória de uma versão anterior: **classifique agora,
diga que classificou, e grave** — não pergunte ao arquiteto o que você pode
inferir do que já está escrito ali.

## O que o perfil nunca faz

- **Não impede o arquiteto de avançar.** Perfil profundo não autoriza segurar a
  escrita até a última pergunta ser respondida.
- **Não vira rótulo na conversa.** Diga *"vou trabalhar leve aqui: um time, uma
  aplicação, um banco"*, não *"classifiquei sua iniciativa como perfil leve"*.
- **Não decide a estratégia.** Perfil é sobre o peso do **processo**; a
  organização do modelo sai do propósito e das características, e duas
  iniciativas de perfis diferentes podem receber a mesma estrutura.
- **Não sai de uma palavra do briefing.** Se a única evidência que você tem é o
  vocabulário, você ainda não calibrou — descobriu que precisa de mais uma
  pergunta.
