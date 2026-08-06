# 13 — Plataforma complexa  *(teste de profundidade)*

## Briefing

> Sou arquiteto do varejo. A gente precisa de C4 do ecossistema de vendas. Tem
> bastante coisa e nunca ninguém desenhou isso inteiro. Por onde a gente começa?

## Respostas preparadas

Responda **apenas ao que for perguntado**. O briefing é curto de propósito: tudo
abaixo só aparece se o plugin for atrás.

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "duas: onde colocar o novo motor de promoções, e se dá para o time de catálogo se separar do de vendas" |
| quem lê? | "o comitê de arquitetura decide a primeira; os quatro tech leads decidem a segunda" |
| quantos times? | "seis. Vendas, catálogo, pagamentos, logística, dados e uma célula de plataforma" |
| quantos domínios? | "vendas, catálogo, pagamento, entrega. Dados atravessa todos" |
| quantas aplicações? | "um app mobile, um site, dois BFFs, uns treze serviços e o ERP antigo, que ainda fatura" |
| bancos? | "cada serviço tem o seu, quase todos Postgres. Catálogo usa Mongo e um Elasticsearch. O ERP é Oracle" |
| mensageria? | "Kafka. Uns quarenta tópicos, ninguém sabe o mapa" |
| plataforma de dados? | "tem lake, tem warehouse. O time de dados lê direto do banco de alguns serviços, o que a gente sabe que é errado" |
| legado? | "o ERP. Faturamento e fiscal ainda são lá, e ninguém quer tocar" |
| integrações externas? | "três gateways de pagamento, duas transportadoras, marketplace da Amazon e do Mercado Livre" |
| ownership? | "por serviço, com dois órfãos que ninguém assume" |
| ambientes, regiões? | "AWS, uma região, três ambientes. Não muda nada arquiteturalmente" |
| segurança? | "Keycloak para cliente, outro IdP interno para funcionário. PCI escopa pagamentos" |
| já existe algo? | "uns desenhos no Miro, de dois anos atrás, com metade errada" |
| horizonte? | "quero que isso vire o mapa oficial, e sobreviva aos próximos dois anos" |
| começo por onde? | "você me diz" |

## Armadilhas

- **A pergunta final é a armadilha do cenário.** "Você me diz" é um pedido de
  recomendação, não uma abertura para devolver a pergunta.
- **Duas decisões, duas audiências.** Elas pedem recortes diferentes, e tratá-las
  como uma só produz o desenho que serve mal aos dois públicos.
- **Muita coisa cabe numa modelagem só.** Seis times não são seis modelagens: o
  que atravessa é enorme (Kafka, o ERP, os dados). Separar em modelagens aqui é
  o erro caro — e o corte é o que precisa aparecer junto, não o organograma.
- **A leitura direta dos bancos pelo time de dados** é o achado arquitetural mais
  valioso do briefing, e só aparece se perguntarem por dados.
- Modelar quarenta tópicos de Kafka como quarenta caixas é ruído; o plugin
  precisa decidir granularidade e dizer o critério.

## Critérios específicos

1. Classifica como perfil **profundo** com evidências nomeadas — e não pela
   palavra "ecossistema" nem por "varejo".
2. Conduz a descoberta em **rodadas temáticas anunciadas**, não num bloco.
3. Cobre dados, mensageria, legado, integrações externas, ownership e segurança —
   e diz explicitamente o que ficou de fora (ambientes, por exemplo) e por quê.
4. Apresenta **alternativas de organização** com o custo de cada uma, recomenda
   uma, e pede objeção em vez de devolver a escolha.
5. Responde "começo por onde" com um **recorte inicial justificado** pela decisão
   mais urgente.
6. Propõe **modelagem em ondas**, com objetivo e critério de conclusão por onda.
7. Trata as duas decisões como recortes distintos, não como um diagrama maior.
8. Registra a leitura direta dos bancos como risco ou pergunta arquitetural.
9. Não começa a escrever YAML antes do checkpoint da organização.

## Comparação obrigatória

Junto com **12**: mesmas skills, processos deliberadamente diferentes. E junto
com **01**, que também se chama plataforma e precisa sair **leve** — se os dois
receberem o mesmo peso, a calibragem está seguindo vocabulário.
