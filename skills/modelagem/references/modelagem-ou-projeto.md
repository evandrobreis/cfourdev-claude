# Modelagem ou projeto — onde uma coisa nova vai morar

Duas coisas já se chamaram "projeto" no cfourdev. Hoje só uma se chama:

```
MODELAGEM   uma realidade:  propósito, audiência, glossário, taxonomia e memória próprios
PROJETO     uma pasta:      uma unidade de navegação dentro de UMA modelagem
```

Quando um assunto novo chega, a pergunta não é "que pasta crio". É:

> **Isto é outra realidade, ou é mais uma parte da que já está aberta?**

Errar para o lado do projeto mistura dois vocabulários no mesmo `workspace.yaml` e
julga dois modelos pela mesma régua. Errar para o lado da modelagem separa coisas
que precisavam de uma seta entre si — e **seta direta entre modelagens não
existe**. Existe o **espelho**, que é outra coisa e custa mais (ver abaixo).

## O corte

| sinal | vira |
|---|---|
| a decisão ou conversa que a modelagem apoia é **outra** | **modelagem** |
| a mesma palavra significa coisas diferentes nos dois (conflito de glossário) | **modelagem** |
| as chaves de `metadata` / a taxonomia não combinam | **modelagem** — sinal mais forte, ver abaixo |
| ciclo de revisão, ownership ou confidencialidade separados | **modelagem** |
| **muitas setas precisam atravessar**, ou as duas coisas aparecem no mesmo desenho | **projeto** — argumento decisivo |
| **uma ou duas** setas atravessam, e o resto é mesmo separado | **modelagem + espelho** |
| um lê o modelo do outro para se orientar | **projeto** |
| audiência, granularidade ou horizonte diferentes | nenhum dos dois: **investigue** |

Os três primeiros são sobre **régua**; o quarto é sobre **processo**; os dois
seguintes são sobre **grafo**. Quando eles apontarem para lados opostos, o grafo
ganha: duas realidades que precisam se desenhar juntas são uma realidade com duas
partes, e a divergência de vocabulário entre elas é o achado — leve-a para o
`glossary` do `project-context.yaml`, não para o sistema de arquivos.

## O espelho, e por que ele não dissolve o corte

Uma modelagem representa o vizinho de outra como uma caixa `external` local — que
é o que o C4 já manda fazer com o que está fora do seu modelo. O campo `bind`
diz de quem aquela caixa é espelho:

```yaml
- id: pedido-confirmado-loja
  name: Pedido Confirmado
  shape: external
  bind:
    modelagem: vendas
    ref: loja/pedido-confirmado
```

Lida sozinha, é uma caixa comum e o modelo compila. Lidas juntas, o espelho se
dissolve no elemento real e a seta chega nele, com interior e drill-down.

**Isto não transforma "uma seta atravessa" em não-argumento.** O espelho é uma
declaração por vizinho, escrita à mão, que envelhece com o modelo do outro (o
`cfour check --all` avisa quando o alvo some). Vale para **um punhado** de
pontos de contato conhecidos. Uma fronteira com dez setas atravessando não é uma
fronteira: é uma modelagem só, com dois projetos — e nesse caso o espelho é
trabalho manual para reconstruir o que uma pasta a mais daria de graça.

Ou seja: o espelho muda a resposta de "impossível" para "possível e com custo".
Nomeie o custo; não o esconda.

## Por que a taxonomia é o sinal mais forte

`workspace.yaml` é **um por modelagem**. Ele declara os rótulos das chaves de
metadado e quais entram em "Colorir por". Duas frentes que precisam de
`metadata` incompatíveis — `dominio`/`subdominio`/`owner` de um lado,
`domain`/`product`/`criticality`/`layer` do outro — não cabem num arquivo só sem
que um dos dois vocabulários vire ruído para quem lê o outro.

Isso não é hipótese: aconteceu numa modelagem real, ficou registrado numa
decisão de modelagem, e foi o que motivou esta camada existir.

## O que NÃO é argumento

- **"São times diferentes."** Time é `meta: { owner }` e `groupBy`. Vira modelagem
  só quando os ciclos de revisão forem mesmo independentes.
- **"São sistemas diferentes."** Sistema é uma caixa sem `parent`. Projetos
  separados na mesma modelagem já dão namespace e barra lateral próprios.
- **"É outra entrega / outra fase / outro trimestre."** Recorte de trabalho é
  `tag`. Modelagem por entrega envelhece junto com a entrega.
- **"Fica mais organizado."** Organização de arquivos é a pergunta de
  `cfour:estrategia`, e ela se resolve com pastas dentro do projeto.

## Antes de propor uma modelagem nova

Duas perguntas de corte, na conversa, antes de tocar no registry:

1. **Alguma modelagem existente já é essa realidade?** Então isto é um projeto
   nela — ou nem isso, e é só um recorte por `tag`.
2. **O que vai precisar atravessar, e quantas vezes?** Nenhuma seta: separe sem
   pensar duas vezes. Uma ou duas, em pontos de contato estáveis: separe e
   declare um espelho para cada — diga quantos, em voz alta. Muitas, ou nem dá
   para listar: era uma modelagem só com dois projetos, e a separação vai cobrar
   um espelho por seta, para sempre.

E a regra que vale sempre: **havendo duas organizações plausíveis, apresente as
duas** (guarda-corpo 4). Modelagem nova é decisão do arquiteto, não sua.

## Quando a decisão for tomada

- Modelagem nova → `cfour:modelagens` cria o esqueleto e registra; a escolha vira uma
  `MD-NNN` **na modelagem nova**, e o critério que a produziu vai junto.
- Projeto novo → é assunto de `cfour:estrategia`, dentro da modelagem aberta.
- Em qualquer dos dois casos, o termo em disputa entra no `glossary` do
  `project-context.yaml` da modelagem onde ele foi usado.
