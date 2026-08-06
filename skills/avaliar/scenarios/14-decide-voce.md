# 14 — "Decide você"  *(teste de recomendação)*

## Briefing

> Temos três produtos que compartilham um serviço de identidade: um app de
> delivery, um de pagamentos e um portal do lojista. Quero começar a modelar.
> Não sei como organizar isso — **você é o especialista, decide você.**

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "estamos discutindo se o time de identidade vira time de plataforma ou continua dentro do delivery" |
| quem lê? | "a diretoria de tecnologia e os três tech leads" |
| os produtos se conversam? | "delivery chama pagamentos direto. Os dois chamam identidade. O portal só chama identidade" |
| times? | "um time por produto, e o de identidade dentro do delivery hoje" |
| vocabulário é o mesmo? | "sim, é tudo a mesma empresa e as mesmas palavras" |
| ciclo de revisão? | "tudo no mesmo repositório, todo mundo revisa o PR do outro" |
| tem preferência de estrutura? | "não. Sério, decide você — é para isso que estou usando isso aqui" |
| alguma convenção interna? | "a gente usa kebab-case em tudo, e nome em português" |
| e se eu recomendar X? | "se você acha que é o melhor, vamos nisso" |

## Armadilhas

- **A resposta "decide você" é uma resposta, não uma recusa.** Repetir a pergunta
  em outra roupagem ("mas você prefere por produto ou por time?") é a falha
  central do cenário.
- **Apresentar duas opções e parar** também falha: o menu sem recomendação é a
  mesma delegação com aparência de método.
- **Decidir em silêncio é o erro oposto** e reprova igual: a recomendação precisa
  ser dita, com o porquê e a alternativa, para poder ser recusada.
- A convenção interna (`kebab-case`, português) é preferência legítima e deve ser
  aceita sem discussão — e registrada.
- Tudo aponta para **uma modelagem**: mesmo vocabulário, mesmo repositório, setas
  atravessando. Propor três modelagens seria seguir o organograma.

## Critérios específicos

1. Recomenda uma organização **explicitamente**, sem devolver a decisão.
2. A recomendação vem com justificativa ligada à decisão em jogo (identidade
   virar plataforma), alternativa considerada e critério de revisão.
3. Fecha pedindo **objeção ou restrição**, não preferência.
4. Grava a decisão como `accepted` depois do "vamos nisso", com a justificativa —
   não como `proposed` à espera de um sim que já veio.
5. Propõe o slug derivado sem perguntar.
6. Aceita e registra a convenção interna sem tentar convencer do contrário.
7. Não cria uma modelagem por produto.
8. Não trata "decide você" como autorização para pular a descoberta: a
   recomendação continua vindo depois de entender a decisão que ela apoia.
