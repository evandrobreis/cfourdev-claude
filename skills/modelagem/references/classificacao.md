# Classificação — o que o desenho responde sem virar caixa nova

A cobertura técnica (`cobertura-tecnica.md`) garante que **nada existe em
silêncio**: as caixas, os bancos, as filas. Este arquivo é o outro lado — o que o
leitor consegue **fazer** com o desenho depois de pronto: filtrar, agrupar,
colorir e sair para o documento que explica aquela caixa.

O sintoma da falta é silencioso e não tem quem reclame: entrega-se um modelo
correto, cinza, sem um filtro útil, sem cor e sem um link — e ninguém diz *"você
não perguntou da cor"*, porque quem nunca abriu o viewer não sabe que ela existe.

Quatro eixos, e cada um precisa ter uma resposta — **inclusive "não se aplica"**
— antes de a estratégia fechar.

> A informação é dele; a forma é sua. **Por quais eixos a organização já fala** e
> **que documentos já existem** são fatos que só o arquiteto tem — isso se
> pergunta. Se aquilo vira `tag` ou `meta`, qual ganha cor e como a chave se
> chama é decisão de modelagem — isso se recomenda. Ver `decisoes-de-quem.md`.

## Os quatro eixos

### `localizar` — por onde eles acham uma coisa

A pergunta é sobre **vocabulário em uso**, e não sobre o que seria bonito ter:

> Quando vocês falam de um serviço aqui dentro, por quais eixos vocês o
> localizam? Domínio, squad, produto, criticidade, onda de migração?

Uma resposta como *"a gente organiza por domínio e por squad"* é matéria-prima de
duas chaves de `meta`. *"Nunca precisei"* é `not_applicable`, e vale registrar.

**Um efeito colateral que vale ouro:** eixos incompatíveis entre duas frentes —
`dominio`/`subdominio` de um lado, `product`/`criticality` do outro — são o
**sinal mais forte** de que são duas modelagens, e não dois projetos
(`modelagem-ou-projeto.md`). Perguntar isto na descoberta é o que faz esse sinal
aparecer antes de a estrutura estar escrita.

### `filtrar` — o que o leitor vai querer isolar

> Olhando o desenho pronto, o que você vai querer isolar? "Só o que é do time X",
> "só o que é crítico", "só o que ainda depende do legado"?

Toda chave de `meta` **já vira um filtro sozinha**, sem configurar nada — o custo
de escrever é baixo. O que é caro é manter uma classificação que ninguém usa, e
por isso a pergunta é sobre o que ele vai isolar, não sobre o que existe.

Sinalizador acumulável (`legado`, `pci`) é `tag`; classificação com valor
(`domain: vendas`) é `meta`.

### `colorir` — a que o desenho responde em dois segundos

> Se o desenho pudesse ser pintado por uma classificação só, qual delas conta a
> história mais rápido para quem vai ler?

É o eixo mais visível do viewer e o que o plugin mais esquece. Vale saber, para
recomendar bem:

- só chaves marcadas com **`color: true`** em `$M/model/workspace.yaml` aparecem
  em "Colorir por". A chave existe e filtra sem isso; ela não **colore**;
- o mesmo valor sai na **mesma cor em qualquer visão** da modelagem;
- quem **não tem** valor fica cinza — "não classificado" fica visível, e não
  disfarçado de categoria.

Uma só chave costuma bastar. Duas, quando o leitor troca de pergunta (o comitê vê
por domínio, o time de plantão vê por criticidade).

### `linkar` — o que fica a um clique da caixa

> Cada sistema tem ADR, runbook, painel ou repositório com endereço fixo? Vale o
> clique sair da caixa e chegar lá?

Um valor de `meta` que **é uma URL** vira um 🔗 na quina da caixa. Não existe
campo `links:`, e não precisa. O rótulo do link é o nome da chave — `adr`,
`runbook`, `painel` —, e declarar `metadata: { adr: { label: ADR } }` no
`workspace.yaml` troca a chave crua por um nome legível.

Uma consequência a saber ao desenhar: **URL não vira filtro**, e é isso que
impede a barra lateral de encher de endereços.

> A descoberta **já pergunta por ADRs e diagramas antigos** como insumo. Este
> eixo fecha o laço: o que existe e tem endereço fixo pode ficar pendurado na
> caixa, em vez de morrer na conversa.

## Proporcional ao perfil

Com perfil `leve`, **uma pergunta agrupada** fecha os quatro:

> Quando o desenho estiver pronto, o que você vai querer distinguir nele — por
> time, por domínio, por criticidade? E tem documento por sistema (ADR, runbook,
> painel) que valha deixar a um clique?

Com perfil `intermediario`, duas rodadas: `localizar` + `filtrar` numa,
`colorir` + `linkar` na outra.

Com perfil `profundo`, os quatro eixos nomeados, junto com a audiência a que cada
um serve.

**Em nenhum perfil se lê a lista em voz alta**, e em nenhum se pergunta "você
quer tags?" — a pergunta é sobre o trabalho dele, e a tradução para o formato é
sua.

## Onde isso fica gravado

Em `$MEM/project-context.yaml`, o bloco `classification`. A **descoberta**
preenche `axes`, `artifacts` e `status`; a **estratégia** preenche `keys`:

```yaml
classification:
  status: relevant            # relevant | not_applicable | unknown | deferred
  axes: [dominio, squad]      # como a organizacao ja fala, nas palavras dela
  artifacts:                  # o que existe com endereco fixo
    - { tipo: adr, escopo: por-sistema, note: "confluence interno" }
    - { tipo: runbook, escopo: parcial, note: "so os tres criticos" }
  keys:                       # o que a estrategia recomendou, e ele aceitou
    - { chave: domain, tipo: meta, responde: "de que dominio e?", usada_para: [filtro, cor, groupBy], color: true }
    - { chave: owner,  tipo: meta, responde: "quem conserta quando quebra?", usada_para: [filtro] }
    - { chave: legado, tipo: tag,  responde: "ainda depende do legado?", usada_para: [filtro, exclude] }
    - { chave: adr,    tipo: meta, responde: "onde esta a decisao?", usada_para: [link] }
```

Os mesmos quatro `status` da cobertura técnica, pela mesma razão: **`unknown`
explícito vale mais que campo ausente**, porque ausência não distingue "não
perguntei" de "não importa".

## O portão

> **Não feche a estratégia com `classification.status: unknown` sem dizer isso em
> voz alta.**

Dizer basta:

> Fecho a estratégia sem taxonomia: com um time só e cinco caixas, `owner` não
> responderia pergunta nenhuma hoje. Quando entrar o segundo time, vale
> retomar — é uma linha por caixa.

E o oposto também se diz. Uma modelagem de comitê sem cor nenhuma é uma escolha,
não um esquecimento — mas só é escolha se alguém a tiver feito.

## Classificar não é catalogar

Cobrir os quatro eixos **não** significa criar quatro chaves. Significa saber se
cada um importa.

Uma modelagem de cinco caixas com `classification: not_applicable` está perfeita.
O que ela não pode ter é um modelo inteiro escrito sem que ninguém tenha
perguntado o que o leitor ia querer isolar — e um viewer que se abre cinza,
quando duas linhas de `meta` o fariam responder a pergunta que motivou a
modelagem.
