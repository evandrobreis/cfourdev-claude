# Sobre

O [cfourdev](https://cfourdev.com.br) é uma plataforma criada para ajudar times de tecnologia a
manter sua arquitetura de software documentada em um modelo versionado, compartilhável, colaborativo
e centralizado.

O funcionamento é simples:

1. O modelo é escrito em YAML no seu repositório git, em um formato aberto;
2. Utilize a [CLI](https://www.npmjs.com/package/cfour-cli) para escrever, validar, visualizar e publicar a documentação;
3. Utilize o [portal](https://app.cfourdev.com.br) para visualizar a arquitetura de forma centralizada.

## O que este plugin faz

Este plugin é um complemento à ferramenta. Ele é um **operador contextual**: entende
o software que você está documentando e o objetivo da documentação, interpreta o que
você pede em português, e traduz isso em comandos da CLI `cfour` — executando,
validando e relatando o resultado.

Você não precisa decorar nem digitar comando nenhum:

> *Adicione o SAP como sistema externo.*
> *Ligue o portal ao BFF por HTTPS.*
> *Crie um diagrama de containers do Identity.*

### O que ele não faz

**A arquitetura é sua. A semântica da modelagem também.** O plugin não projeta, não
melhora, não escolhe arquitetura, não sugere decomposição de serviços, não decide
domínios, fronteiras, ownership ou granularidade, e não escolhe quais diagramas
deveriam existir.

Ele opera decisões que **você** tomou. A regra que sustenta isso é uma só:

> **Nenhuma decisão arquitetural ou semântica de modelagem se toma por inferência do
> agente. Quando falta uma informação necessária para materializar o modelo, ele
> pergunta — não decide.**

O conhecimento de C4 continua lá, como **guarda-corpo**: se você pedir para cadastrar
como Container algo que, pelo que já foi dito, não parece um Container, ele aponta o
conflito e pede confirmação. E aí a decisão continua sendo sua — inclusive a de seguir
assim mesmo.

Ele também não escreve o YAML do modelo na mão. Tudo o que ele grava passa por um
comando da CLI `cfour`: o que a ferramenta ainda não sabe fazer, ele relata — dizendo
qual comando falta — em vez de improvisar no arquivo. Você continua livre para editar
o modelo à mão quando quiser; o plugin é que não faz isso no seu lugar.

## Instalar

Adicione este repositório como marketplace no seu Claude Code.

```
/plugin marketplace add evandrobreis/cfourdev-claude

/plugin install cfour@cfourdev
```

Você também precisa da CLI:

```
npm i -g cfour-cli
```

Depois, no repositório onde você vai documentar:

```
/cfour:setup
```

## Atualizar

```
/plugin marketplace update cfourdev

/plugin update cfour@cfourdev
```

## As skills

O núcleo roteia sozinho — você conversa, não escolhe comando.

| Arquivo | Descrição |
|---|---|
| `cfour:modelagem` | o núcleo: o invariante, as duas fases, a modelagem ativa, a precedência das fontes |
| `cfour:setup` | confere a CLI, o registro e a memória antiga; oferece o que falta |
| `cfour:contexto` | entende o software e o objetivo da documentação, em rodadas curtas |
| `cfour:operar` | traduz o pedido em comando da CLI, executa, confere e publica |
| `cfour:cli` | descobre e mantém em cache as capacidades reais da CLI instalada |
| `cfour:sessao` | retoma o trabalho, aponta divergências objetivas e encerra o dia |

O plugin **não consulta a internet**: quem descreve a ferramenta é a própria
ferramenta, por `cfour help`.

## Licença

Uso livre, inclusive comercial; não redistribua fora do marketplace. **O que o
plugin escreve a seu pedido é seu.** Veja `LICENSE` — são doze linhas.

## Referências

- Plataforma — [cfourdev.com.br](https://cfourdev.com.br)
- CLI no npm — [npmjs.com/package/cfour-cli](https://www.npmjs.com/package/cfour-cli)
- O modelo C4 — [c4model.com](https://c4model.com/)
- Este repositório — [github.com/evandrobreis/cfourdev-claude](https://github.com/evandrobreis/cfourdev-claude)
