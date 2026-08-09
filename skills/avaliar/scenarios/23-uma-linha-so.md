# 23 — Uma linha só  *(teste do caminho curto)*

## Preparação

O repositório descartável tem `cfour.yaml`, e ele está **vazio** — nenhuma
modelagem registrada:

```yaml
version: 1
modelagens: []
```

Não crie o diretório da modelagem nem o de memória. Esta descoberta é a
primeira, e é isso que põe o `id` em jogo: com uma modelagem já registrada, o
critério 4 não mede nada, porque não há id para nascer.

## Briefing

> quero modelar um sistema de pedidos

E nada mais. Sem stack, sem tamanho de time, sem decisão declarada — o `12` já
chega com briefing rico (`12-aplicacao-simples.md:5-7` traz stack, time e
intenção) e por isso **não** mede isto. O que está sob teste é o que o plugin faz
quando a única coisa que ele tem é uma frase: quantas rodadas até a estratégia,
quanto arquivo de memória antes do primeiro diagrama, e se o desenho existe no
fim da sessão.

## Respostas preparadas

Responda **apenas ao que for perguntado**, e nunca ofereça o que não foi pedido.
Este cenário se decide na primeira metade da conversa: cada informação abaixo que
o plugin não for buscar é uma que ele não vai ter.

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "quero decidir se o cálculo de frete continua dentro do sistema ou vira coisa à parte. Queria enxergar antes de discutir isso com o time" |
| quem lê? | "eu e o outro dev. O pessoal de produto às vezes olha" |
| o que o sistema faz? | "recebe o pedido que vem do site, confirma o pagamento e manda para a expedição" |
| stack, o que roda? | "uma API em Java e um Postgres. O site é de outra equipe" |
| banco, fila, cache, algo em background? | "só o Postgres. Tem um job de hora em hora que reprocessa pagamento pendente" |
| integrações? | "o gateway de pagamento e o ERP da expedição" |
| quantas pessoas, quantos times? | "dois devs. Eu e mais um" |
| ambientes, regiões? | "homologação e produção, iguais" |
| segurança, regulação? | "nada demais. Cartão nem passa por nós, é tokenizado no gateway" |
| o que acontece quando dá errado? | "o pior é pagamento aprovado e o pedido não subir para a expedição. Já aconteceu duas vezes" |
| o que você vai querer distinguir no desenho? | "nunca pensei nisso. Talvez o que é nosso e o que é de fora" |
| tem documento por sistema — ADR, runbook, painel? | "tem um runbook do job, no Confluence" |
| como vocês chamam isso internamente? | "de pedidos, ou fluxo de pedido" |
| tem versão futura, alvo, transição? | "não. É o que tem hoje" |
| o que fica de fora? | "o site, que não é nosso. E o ERP a gente só chama" |

## Armadilhas

- **Ausência de informação não é sinal de complexidade.** O briefing não diz nada
  — e um plugin que lê isso como incerteza, e incerteza como peso, sai fazendo
  rodadas temáticas para um caso de dois devs. As evidências que decidem o perfil
  vêm das **respostas**, e todas cabem em duas rodadas.
- **O job de hora em hora** é a única coisa assíncrona da arquitetura, e o
  arquiteto só o menciona se perguntado por background.
- **O final triste** — pagamento aprovado e pedido que não sobe — é matéria de
  fluxo, e só aparece se alguém perguntar o que acontece quando dá errado.
- **Não há id na frase.** "Sistema de pedidos" é assunto, não nome: o slug só tem
  de onde nascer depois de o arquiteto dizer como eles chamam aquilo. Fixar
  `sistema-de-pedidos` na primeira mensagem é o erro que a sessão `05` corrigiu.
- **A resposta da classificação é "nunca pensei nisso"** — e isso *é* resposta:
  sobra dela um eixo (nosso × de fora) que vale uma chave, ou a decisão explícita
  de não ter nenhuma. O que reprova não é a resposta curta; é ninguém ter
  perguntado.
- **A memória no fim é o segundo teste do cenário.** Um `project-context.yaml`
  com vinte e cinco campos datilografados como `unknown` depois de duas rodadas
  de conversa é o caminho longo com aparência de curto.

## Critérios específicos

1. Calibra como **`leve` sem pedir permissão** para isso — escolhe, diz em uma
   linha por quê, e segue.
2. Chega à estratégia em **no máximo duas rodadas** de perguntas.
3. Escreve a **onda 1 na mesma sessão**: existe diagrama no fim da conversa.
4. **Não fixa o id antes de o assunto ter nome** — o slug é proposto depois de
   "a gente chama de pedidos", e proposto, não perguntado.
5. Não promete ondas, projetos, perspectivas temporais nem visões que este caso
   não tem.
6. O `project-context.yaml` que sobra **não tem campo datilografado como
   `unknown`** para cumprir lista: o que foi conversado está lá, e o que não foi
   está ausente.

## Comparação obrigatória

Junto com **13**, no teste transversal de calibragem: os dois briefings são
curtos, e um deles esconde seis times, quarenta tópicos e um ERP. Se o peso do
processo sair parecido, ele está vindo do tamanho do briefing e não das
características descobertas.

E junto com **12**: os dois são o mesmo tamanho de iniciativa, e o `12` chega com
stack, time e intenção na primeira mensagem. Os dois têm de sair `leve` — se o
`23` sair mais pesado, o peso está vindo da **falta** de informação, que é
exatamente o que o perfil não pode medir.
