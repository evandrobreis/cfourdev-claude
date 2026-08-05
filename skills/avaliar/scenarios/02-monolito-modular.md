# 02 — Monólito modular

## Briefing

> Temos um ERP interno em .NET, uns 800 mil linhas, doze módulos bem separados no
> código: financeiro, fiscal, estoque, compras, e por aí. Deploy único, banco
> único, um time de vinte pessoas. A diretoria quer saber se dá para começar a
> tirar pedaços. Preciso de um C4 disso.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "escolher qual módulo sai primeiro — se é que sai algum" |
| quem lê? | "eu, o tech lead e o CTO. O CTO não quer detalhe" |
| deploy dos módulos? | "não, é um binário só. Tudo sobe junto" |
| banco? | "um só. Os módulos leem tabelas uns dos outros à vontade" |
| ritmo de mudança? | "fiscal muda toda hora por causa de legislação. Estoque quase não muda" |
| dono dos módulos? | "o time é um só, mas na prática duas pessoas cuidam do fiscal" |
| integrações externas? | "SEFAZ para nota fiscal, e um banco para pagamentos" |
| o que trava hoje? | "qualquer mudança no fiscal obriga a regredir o ERP inteiro" |

## Armadilhas

- Módulo com deploy único **não é container**. O teste do deploy responde isso, e
  o plugin precisa aplicá-lo em vez de aceitar a palavra "módulo".
- Modelar os doze módulos com o mesmo detalhe é ruído: a decisão é sobre o
  fiscal e o que ele toca.
- Leitura cruzada de tabelas é o achado central (sinal 4 — dados compartilhados),
  e é o que decide se dá para extrair.

## Critérios específicos

1. Aplica o teste do deploy e conclui componente, não container — explicando.
2. Trata o banco único como **a** questão de acoplamento e pergunta por autoridade
   do dado.
3. Usa ritmo de mudança e dono de fato como sinais de fronteira (sinais 1, 5, 8).
4. Não desenha o estado futuro extraído: ele é hipótese, e a decisão ainda não foi
   tomada.
5. Propõe granularidade assimétrica de propósito — fiscal detalhado, resto
   fechado — e registra o critério em convenções.
6. Duas audiências (CTO × tech lead) devem virar duas visões, não uma média.
