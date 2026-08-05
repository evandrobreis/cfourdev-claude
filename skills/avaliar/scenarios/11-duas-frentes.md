# 11 — Duas frentes ao mesmo tempo

## Briefing

> Estou em duas coisas esse mês. Uma é a modernização do faturamento aqui de
> casa: quebrar aquele monólito de cobrança em serviços. A outra é uma
> consultoria pra Vertex, que me contratou pra desenhar a arquitetura de
> integração deles com as transportadoras. Preciso de C4 nas duas. Começo por
> qual?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão o faturamento apoia? | "convencer o comitê de que dá pra quebrar em três serviços sem parar a cobrança" |
| que decisão a Vertex apoia? | "eles querem escolher entre um hub de integração e ponto a ponto. É essa escolha" |
| quem lê o faturamento? | "o comitê de arquitetura daqui e os dois times de billing" |
| quem lê a Vertex? | "o CTO deles e a consultoria que vai implementar. Nada disso pode circular aqui dentro" |
| as duas se relacionam? | "não. São empresas diferentes" |
| alguma caixa aparece nas duas? | "não. Nem cliente em comum elas têm" |
| alguma seta atravessa? | "não faria sentido nenhum" |
| o vocabulário é o mesmo? | "aqui a gente organiza por domínio e squad. Na Vertex é por produto e criticidade — é como o time deles fala" |
| "serviço" quer dizer a mesma coisa nos dois? | "não. Aqui serviço é um deploy. Lá eles chamam de serviço a oferta comercial que vendem pro cliente" |
| quem revisa cada um? | "o faturamento passa no PR do time. A Vertex eu entrego em PDF e eles nem têm o repositório" |
| começo por qual? | "tanto faz, decide você — só não quero misturar" |
| tem prazo? | "a Vertex é pra semana que vem. O faturamento não tem data" |

## Armadilhas

- **Duas realidades, não dois projetos.** Propósitos diferentes, audiências
  disjuntas, vocabulários incompatíveis (`dominio`/`squad` × `produto`/
  `criticidade`), ciclos de revisão separados e confidencialidade: são duas
  **modelagens**. Enfiar as duas num `model/` só as julga pela mesma régua e
  coloca conteúdo de cliente na barra lateral de casa.
- **"Serviço" com dois sentidos** é o sinal mais barato do briefing, e ele só vale
  se for perguntado. Cada sentido pertence ao `glossary` da sua modelagem — não
  existe glossário compartilhado a desempatar.
- **O corte não é "empresas diferentes".** Se uma seta precisasse atravessar, a
  resposta seria dois projetos numa modelagem só, apesar de empresas diferentes.
  O plugin precisa **perguntar o que atravessa**, não deduzir do CNPJ.
- **Nada de descoberta única.** Cada modelagem tem seu `project-context.yaml`, sua
  série `MD-001` e sua sessão. Uma descoberta que responde as catorze perguntas
  "pelas duas ao mesmo tempo" já errou.
- **A pergunta "começo por qual" não é a pergunta.** Responder a ordem sem
  perceber que são duas realidades passa por prestativo e é a falha do cenário.

## Critérios específicos

1. Percebe que há **duas realidades** antes de propor qualquer estrutura, e diz
   isso explicitamente.
2. Pergunta **o que precisa atravessar** — seta, caixa compartilhada, desenho
   comum — e usa a resposta como argumento, não o fato de serem empresas
   diferentes.
3. Levanta o conflito de vocabulário (`serviço`; `dominio`/`squad` ×
   `produto`/`criticidade`) e o trata como sinal de régua separada, não como
   detalhe a normalizar.
4. Propõe **duas modelagens** com justificativa, alternativa considerada (uma só,
   com dois projetos) e condição de revisão — e deixa a escolha com o arquiteto.
5. Nomeia o custo da separação: **não existe seta direta entre modelagens** — o
   que atravessa é um espelho (`bind`), declarado à mão, um por vizinho, e que
   envelhece com o modelo do outro. Nomear "é impossível" também reprova: é
   possível e custa; o que não pode é o custo ficar escondido.
6. Conduz **uma descoberta por modelagem**, sem misturar as respostas, e anuncia
   em qual está trabalhando a cada momento.
7. Não copia contexto, convenções nem decisões de uma para a outra.
8. Responde "começo por qual" com o que a conversa dá (o prazo da Vertex), sem
   deixar que a pergunta substitua a decisão estrutural.

## Comparação obrigatória

Junto com o cenário **04** (integração entre organizações): também são duas
empresas, e ali as necessidades **exigem** que as duas apareçam no mesmo desenho.
As estratégias devem sair **diferentes** — duas modelagens aqui, uma com dois
projetos lá — e a diferença precisa estar justificada pelo que atravessa, nunca
por "são organizações distintas", que é verdade nos dois.
