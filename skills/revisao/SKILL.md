---
name: revisao
description: Revisa a qualidade de uma modelagem C4 no cfourdev em quatro dimensões separadas — correção técnica, coerência C4, qualidade comunicacional e qualidade arquitetural. Use para avaliar um modelo existente, revisar o que acabou de ser escrito, preparar uma revisão em pull request, ou quando alguém perguntar se os diagramas estão bons.
---

# Revisão da modelagem

Quatro dimensões, avaliadas **separadamente e nesta ordem**. Elas falham de
formas diferentes, e misturá-las produz um relatório em que ninguém confia.

> **Um diagrama sintaticamente válido não é um bom diagrama.** A dimensão 1 passa
> sozinha; as outras três é que decidem se o modelo serve para alguma coisa.

Leia `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/viewer-contract.md` e
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/heuristics.md`. O propósito contra o qual se julga está em
`$MEM/project-context.yaml` — sem ele, as dimensões 3 e 4 não têm régua, e
você deve dizer isso em vez de inventar uma.

**A régua é de uma modelagem.** Resolva qual antes de começar e anuncie; revise
uma por vez. Julgar duas modelagens pelo mesmo propósito reprova a que tinha
outro — e a que passar terá passado por acaso.

---

## 1. Correção técnica

**Delegada, nunca inferida:**

```bash
cfour check --modelagem <id> --json
```

Reporte erros e avisos como o comando os deu, com arquivo. Não classifique por
leitura o que a ferramenta classifica melhor — e não silencie aviso preexistente
por parecer ruído: `passo de fluxo sem seta declarada` e `conteúdo inalcançável`
são achados de modelagem, não de sintaxe.

Saída desta dimensão: a lista, e nada além.

## 2. Coerência C4

O que o check não vê, porque é semântica:

- **Container tem autonomia operacional?** Teste do deploy: *"se eu derrubar isto
  sozinho, o resto continua de pé?"* Se não, é componente e o `parent` está errado.
- **Componente está dentro de um container**, e não solto num sistema.
- **Contexto sem detalhe interno** — nenhuma tecnologia, nenhum banco, nenhuma
  fila na visão de topo.
- **Decomposição consistente** — um sistema com 12 componentes ao lado de outro
  que é caixa fechada precisa de motivo (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/heuristics.md`, sinal 10).
- **Nível declarado à mão** discordando da hierarquia: é aviso do check, mas a
  causa é de modelagem.
- **Fluxo no nível certo** — os passos citam as caixas mais finas que o modelo
  tem? Se citam só containers quando existem componentes, a projeção perde valor.

## 3. Qualidade comunicacional

Julga a **visão**, não o modelo:

- A visão tem uma pergunta declarada, e ela é respondível olhando o desenho?
- A audiência está clara, e o que está ali é do interesse dela?
- O `subject` deixa evidente do que se fala?
- A granularidade responde à pergunta — sem detalhe que ninguém vai usar?
- Quantas caixas? Contexto com mais de ~15 costuma ser duas perguntas coladas.
- A perspectiva é consistente, ou o desenho mistura estrutura com sequência?
- **A modelagem tem história, não só mapa?** Se as decisões em jogo são
  comportamentais — resiliência, ordem, falha, jornada — e não existe nenhum
  fluxo, isso é uma lacuna comunicacional. Não é erro: é uma pergunta a fazer.
- Visões redundantes: duas que respondem à mesma pergunta dividem manutenção e
  divergem.

## 4. Qualidade arquitetural

O que o modelo **revela** — e o que ele esconde. Use `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/heuristics.md` e produza
**perguntas e notas**, nunca refatoração automática:

responsabilidades · dependências · riscos · ownership · acoplamento · resiliência
· dados · segurança · evolução.

Achados típicos desta dimensão:

- caixa com três responsabilidades e um dono só (sinal 1);
- dependência síncrona sem nada dito sobre falha (sinal 2);
- base de dados lida por dois sistemas sem autoridade definida (sinal 4);
- caixa sem `owner` em modelo onde todo o resto tem (sinal 8);
- caixa presente em todas as visões (sinal 9);
- **passos `!`** — o fluxo achou um buraco na estrutura (sinal 13);
- **fluxo sem caminho triste** — o caso de uso só tem final feliz mesmo?
- **área técnica relevante nunca verificada** — `technical_coverage` com
  `unknown` onde a decisão em jogo depende da resposta
  (`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/cobertura-tecnica.md`). Um modelo sem banco, sem fila e sem
  integração pode estar certo; o que ele não pode é estar assim porque ninguém
  perguntou.

## Formato do relatório

Uma seção por dimensão, nesta ordem, e dentro de cada uma:

```
[dimensão] achado — arquivo:linha quando houver
  por que importa (uma frase)
  o que fazer, ou a pergunta a responder
```

Feche com o **veredito separado por dimensão** — "tecnicamente limpo, coerente,
comunicacionalmente fraco na visão X, três perguntas arquiteturais abertas" — e
não com uma nota única. Uma nota única esconde exatamente a informação que a
separação existe para dar.

Ofereça as correções; não as aplique sem combinar. Correção de modelagem muda o
que o desenho **afirma** — é decisão do arquiteto, não do revisor.
