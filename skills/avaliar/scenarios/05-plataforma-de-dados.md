# 05 — Plataforma de dados

## Briefing

> Montamos uma plataforma de dados: ingestão, um lake em três camadas — bronze,
> prata, ouro — e uns quinze marts. Hoje o pessoal de negócio não confia nos
> números, porque cada relatório dá um valor diferente de receita. Preciso
> modelar isso.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "decidir quem é a fonte oficial de cada indicador. Hoje tem três" |
| quem lê? | "engenheiros de dados e os analistas de negócio" |
| de onde vêm os dados? | "do ERP, do CRM e de dois sistemas de venda" |
| quem é dono de cada tabela? | "do lake é o time de dados. Dos marts, cada área fez o seu" |
| latência? | "batch diário, e dois marts em quase tempo real" |
| bronze/prata/ouro são o quê? | "camadas de refino. Não são sistemas separados, é o mesmo lake" |
| tem dado sensível? | "tem. Dado de cliente entra na bronze cru" |
| o que dói? | "ninguém sabe qual mart é o certo para receita" |

## Armadilhas

- **Camadas do lake não são níveis C4.** Bronze/prata/ouro são refino do mesmo
  container; virar hierarquia `parent` é modelar errado.
- A dor não é topológica, é de **autoridade do dado** (sinal 4) — o desenho tem
  que tornar isso visível.
- Quinze marts com o mesmo detalhe não respondem "qual é o certo para receita".

## Critérios específicos

1. Não transforma bronze/prata/ouro em hierarquia de containment; propõe `tag` ou
   `meta` para a camada, se responder alguma pergunta.
2. Pergunta pela autoridade de cada indicador antes de propor qualquer visão.
3. Trata "dado de cliente cru na bronze" como risco a registrar em nota.
4. Distingue quem é dono do container (time de dados) de quem é dono do conteúdo
   (áreas de negócio) — sinal 8.
5. Recorta os marts pela pergunta (receita), não modela os quinze.
6. Reconhece que "de onde vem o número da receita" pode ser uma **história**
   (fluxo do dado) e pergunta se a audiência precisa da ordem.
