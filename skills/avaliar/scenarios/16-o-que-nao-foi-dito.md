# 16 — O que não foi dito  *(teste de cobertura técnica)*

## Preparação

O repositório descartável tem, além do esqueleto de avaliação, um
`docker-compose.yml` na raiz:

```yaml
services:
  api:      { build: ./api, depends_on: [db, redis, rabbitmq] }
  worker:   { build: ./worker, depends_on: [rabbitmq, db] }
  db:       { image: postgres:16 }
  redis:    { image: redis:7 }
  rabbitmq: { image: rabbitmq:3-management }
```

## Briefing

> Preciso modelar nosso sistema de pedidos. É uma API em Python e um front em
> Vue. Quero um C4 para explicar a arquitetura no onboarding e numa apresentação
> para a área de negócio.

## Respostas preparadas

**Nunca ofereça nada que não for perguntado.** O arquiteto deste cenário acha
que já disse tudo.

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "nenhuma decisão. É explicar para quem chega, e para negócio entender o que a gente mantém" |
| quem lê? | "devs novos e o pessoal de negócio. Duas plateias bem diferentes" |
| **tem banco?** | "tem, Postgres. Nem pensei em mencionar" |
| **tem fila ou mensageria?** | "tem RabbitMQ. O worker processa os pedidos assíncrono" |
| **tem cache?** | "Redis, para sessão e para uma listagem cara" |
| **tem processamento em background?** | "o worker. Ele consome a fila e chama a transportadora" |
| **integrações externas?** | "a transportadora e um gateway de pagamento" |
| **plataforma de dados?** | "o BI lê uma réplica do Postgres à noite" |
| infra, ambientes? | "Kubernetes na AWS, dois ambientes. Não acho relevante para o desenho" |
| segurança? | "login próprio, JWT. Nada especial" |
| ownership? | "um time só, seis pessoas" |
| o que dá errado hoje? | "quando a transportadora cai, o pedido fica preso na fila e ninguém vê" |

## Armadilhas

- **O briefing esconde metade da arquitetura**, e ela está no
  `docker-compose.yml` — que o plugin deveria ler antes de perguntar qualquer
  coisa técnica.
- **O que veio do arquivo é evidência, não fato.** Afirmar "a arquitetura usa
  PostgreSQL, Redis e RabbitMQ" sem confirmar reprova o critério 6, mesmo estando
  certo.
- **Duas audiências com necessidades opostas** pedem duas visões, não uma maior.
- **"Nenhuma decisão"** é resposta legítima (onboarding) e muda a granularidade —
  não é motivo para insistir três vezes.
- **O pedido preso na fila** é caminho triste de fluxo, e é o motivo real de
  alguém querer o desenho.
- A infraestrutura é explicitamente irrelevante aqui: registrar
  `not_applicable` com o porquê é o certo; ignorar em silêncio, não.

## Critérios específicos

1. Lê o repositório antes de perguntar, e cita o que encontrou **como
   evidência**, pedindo confirmação.
2. Verifica banco, fila, cache, background, integrações externas e plataforma de
   dados — **sem que o arquiteto ofereça nada disso**.
3. Faz isso de forma proporcional (perfil leve ou intermediário), agrupando, e
   não em sete rodadas.
4. Registra a infraestrutura como não aplicável **com o motivo**, em vez de
   omitir.
5. Não entra na escrita deixando área relevante desconhecida sem dizer em voz
   alta o que ficou de fora.
6. Reconhece a réplica lida pelo BI como leitura entre domínios, e levanta a
   pergunta de autoridade do dado.
7. Propõe duas visões para as duas audiências, com a pergunta de cada uma.
8. Trata "o pedido fica preso" como fluxo com final triste, e pergunta por ele.
