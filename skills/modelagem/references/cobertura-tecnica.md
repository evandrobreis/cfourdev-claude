# Cobertura técnica — o que não pode ser esquecido em silêncio

As heurísticas (`heuristics.md`) são indexadas **por sinal ouvido**: elas dizem o
que investigar quando o arquiteto menciona uma fila, um banco compartilhado, uma
fronteira incerta. Isso funciona para o que ele diz — e falha exatamente no que
ele **não** diz, porque para ele é óbvio.

O sintoma é o arquiteto lembrando o plugin: *"você não perguntou do Kafka"*.
Quando isso acontece, quem estava conduzindo a modelagem era ele.

Este arquivo é a metade proativa: **sete áreas que precisam ter uma resposta —
inclusive "não se aplica" — antes de a escrita terminar.**

> Não é um questionário. A maior parte das áreas se responde **lendo o
> repositório**, e uma pergunta agrupada costuma fechar três de uma vez.

## As sete áreas

### `estrutura-funcional`
Capacidades · domínios e subdomínios · jornadas · atores · responsabilidades ·
ownership · limites organizacionais.

### `aplicacoes`
Web · mobile · BFF · APIs · workers · schedulers · funções · serviços ·
componentes · monólitos · microsserviços · sistemas legados · produtos de
terceiros.

### `dados`
Relacional · NoSQL · cache · storage de objetos · busca · lake · warehouse ·
plataforma de dados · autoridade do dado · replicação · sincronização · leitura e
escrita entre domínios.

### `integracoes`
REST · GraphQL · gRPC · mensageria · streaming · filas · tópicos · webhooks ·
arquivos · batch · protocolos legados · terceiros.

### `infraestrutura`
Cloud · on-premises · híbrido · regiões · clusters · redes · gateways · service
mesh · CDN · balanceadores · ambientes · topologia de implantação **quando ela
muda o desenho**.

### `seguranca`
IdP · autenticação · autorização · fronteiras de confiança · segredos · dados
sensíveis · integrações externas · exigências regulatórias.

### `operacao`
Observabilidade · auditoria · disponibilidade · recuperação · escalabilidade ·
processamento assíncrono · jobs · dependências críticas.

## Como preencher — nesta ordem

1. **Leia o repositório antes de perguntar.** `docker-compose.yml`, manifests de
   Kubernetes, Terraform, `package.json`, `pom.xml`, `.env.example`, pastas
   `migrations/`, `infra/`, `charts/`, README. Um `depends_on: postgres, redis`
   responde duas áreas sem gastar uma pergunta.
2. **Marque o que veio de lá como evidência, não como fato.** *"Encontrei
   manifests de PostgreSQL e Redis. Isso sugere que ambos fazem parte da solução
   — ainda não sei se pertencem a este recorte."* A diferença entre isso e
   *"a arquitetura usa PostgreSQL e Redis"* é o guarda-corpo 2 inteiro.
3. **Aproveite o que já foi dito.** Área respondida no enquadramento não volta
   como pergunta. Perguntar de novo é o modo mais rápido de queimar a paciência
   de quem já respondeu.
4. **Pergunte só o que muda o desenho.** Se a resposta não altera caixa, seta,
   visão nem estratégia, a área é `not_applicable` para **este recorte** — e isso
   se registra, não se omite.
5. **Aprofunde onde a decisão mora.** A área ligada à decisão nomeada no
   enquadramento merece rodada própria; as outras merecem uma linha.

## Proporcional ao perfil

Com perfil `leve`, **uma pergunta agrupada** fecha quatro áreas:

> Além da aplicação principal, existe banco, fila, cache, serviço externo ou algo
> rodando em background que precise aparecer no desenho?

Com perfil `intermediario`, agrupe por proximidade: dados + integrações numa
rodada, aplicações + operação em outra.

Com perfil `profundo`, uma rodada temática por área que importa, anunciada:
*"agora sobre dados: quem é dono de quê, e o que atravessa domínio"*.

**Em nenhum perfil se lê a lista em voz alta.** A lista é sua; a conversa é dele.

## A matriz — onde isso fica gravado

Em `$MEM/project-context.yaml`, uma linha por área:

```yaml
technical_coverage:
  estrutura-funcional: { status: relevant,       source: architect }
  aplicacoes:          { status: relevant,       source: repo, note: "3 servicos + 1 worker no compose" }
  dados:               { status: relevant,       source: repo, note: "postgres, redis — dono nao confirmado" }
  integracoes:         { status: unknown,        source: null }
  infraestrutura:      { status: not_applicable, source: architect, note: "decisao nao depende de topologia" }
  seguranca:           { status: deferred,       source: architect, note: "onda 3" }
  operacao:            { status: unknown,        source: null }
```

| `status` | quer dizer |
|---|---|
| `relevant` | verificada, importa, e o que se sabe está no modelo ou no contexto |
| `not_applicable` | verificada e **não** importa para este recorte — com o porquê |
| `unknown` | ainda não verificada. É dívida, e aparece no fecho de etapa |
| `deferred` | verificada, importa, e foi adiada **de propósito** para uma onda nomeada |

`source`: `repo` (li no repositório) · `architect` (ele afirmou) ·
`inference` (deduzi — e então o item vira `H-NNN`) · `null` (ninguém sabe).

**`unknown` explícito vale mais que campo ausente**, pela mesma razão do resto da
memória: ausência não distingue "não perguntei" de "não importa".

## O portão

> **Não conclua a descoberta, e não entre na última onda de escrita, deixando uma
> área `relevant` como `unknown` sem dizer isso em voz alta.**

Dizer basta. Não é preciso resolver tudo — é preciso que o arquiteto saiba o que
o desenho está deixando de fora:

> Fecho a descoberta com dados e integrações mapeados. **Segurança continua
> desconhecida** — não perguntei porque a decisão em jogo é de fronteira entre os
> dois sistemas. Se o desenho for circular fora do time, vale uma rodada sobre
> isso antes.

Área `unknown` que ninguém nomeou é a única forma de falha desta lista: o modelo
sai plausível, completo na aparência, e sem a fila que sustenta metade do
sistema.

## Cobertura não é completude

Cobrir uma área **não** significa modelá-la. Significa saber se ela importa.

Uma modelagem cuja decisão é "dá para quebrar o monólito em três" pode ter
`infraestrutura: not_applicable` e estar perfeita. O que ela não pode ter é
`infraestrutura: unknown` e um diagrama de implantação inventado — ou a ausência
de qualquer menção a um cluster que decide a resposta.
