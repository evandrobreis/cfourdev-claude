# cfour — o plugin de modelagem do cfourdev

Modelar arquitetura em C4 conversando, e não preenchendo YAML.

O [cfourdev](https://cfourdev.com.br) desenha e publica diagramas C4 escritos
como código — é o pacote npm `cfourdev`. Este plugin é a outra metade: treze
skills que conduzem a modelagem — descobrem que decisão os diagramas precisam
apoiar antes de propor qualquer estrutura, entrevistam, escrevem o YAML pelo
contrato do viewer, revisam, e guardam no seu repositório a memória do que virou
fato, do que ainda é hipótese e do que continua sendo pergunta.

## Instalar

```
/plugin marketplace add evandrobreis/cfourdev-claude
/plugin install cfour@cfourdev
```

E o CLI, que é quem valida e desenha:

```sh
npm i -g cfourdev
```

Os dois são separados de propósito. Sem o CLI você ainda descobre propósito,
decide estratégia, escreve YAML e guarda memória; o que some é o **portão** — a
validação com o mesmo carregador que o viewer usa — e o `cfour serve`. Pergunte
a `/cfour:setup`, que confere os dois e explica o que falta.

### Para um time inteiro

No `.claude/settings.json` do repositório, e quem clonar já recebe:

```json
{
  "extraKnownMarketplaces": {
    "cfourdev": {
      "source": { "source": "github", "repo": "evandrobreis/cfourdev-claude" }
    }
  },
  "enabledPlugins": { "cfour@cfourdev": true }
}
```

## Começar

`/cfour:setup` num repositório novo, e depois deixe a conversa acontecer — as
skills se chamam entre si. Se preferir dirigir:

| você quer | chame |
|---|---|
| preparar o repositório | `/cfour:setup` |
| começar uma modelagem do zero | `/cfour:descoberta` |
| voltar a um trabalho de outro dia | `/cfour:retomar` |
| ver os diagramas, validar tudo, publicar | `/cfour:operar` |

## As treze skills

| | |
|---|---|
| `cfour:modelagem` | o núcleo: método, guarda-corpos, qual modelagem está ativa, roteamento |
| `cfour:setup` | confere CLI, registro e memória antiga; oferece o que falta |
| `cfour:descoberta` | que decisão os diagramas apoiam, para quem, com que escopo |
| `cfour:estrategia` | organização, projetos, taxonomia, e quais visões valem a pena |
| `cfour:entrevista` | o arquiteto descreve; a skill separa fato de inferência |
| `cfour:editor` | escreve e altera o YAML, pelo contrato, e valida |
| `cfour:revisao` | revisa em quatro dimensões separadas |
| `cfour:modelagens` | lista, cria, troca e registra as realidades paralelas |
| `cfour:retomar` | carrega a memória e diz onde o trabalho parou |
| `cfour:encerrar` | consolida o que virou fato e grava o resumo do dia |
| `cfour:reconciliar` | acha onde memória e modelo divergiram |
| `cfour:operar` | `serve`, `check --all`, `login`, `push`, `status` |
| `cfour:avaliar` | a suíte que valida **este plugin**; é para quem o desenvolve |

## O princípio

> **Descobrir antes de prescrever.**

Iniciativas diferentes usam as mesmas palavras para coisas diferentes.
"Plataforma", "legado", "componentização", "jornada" descrevem o vocabulário de
quem fala, não a arquitetura de quem escuta. Duas iniciativas com o mesmo rótulo
devem poder receber estratégias **diferentes**; duas com rótulos diferentes devem
poder receber a **mesma**, quando as necessidades coincidem.

Se o rótulo decidiu a estrutura, o plugin falhou — e é isso que `cfour:avaliar`
mede, com onze cenários e três testes cruzados.

## Onde as coisas ficam no seu repositório

```
cfour.yaml                     o registro: quais modelagens existem
<path do registro>/            o modelo — o que o viewer desenha
  modelagem.yaml
  model/
.claude/cfour/history/<id>/    a memória: contexto, sessão, decisões
```

A memória vai para o git junto com o modelo. É o que permite revisar uma mudança
de arquitetura em pull request com o desenho, o porquê e o histórico no mesmo
commit.

Ela mora sob `.claude/` porque é escrita aqui, por este plugin — o `cfour.yaml`
mora na raiz porque quem o escreve é o `cfour init`, sem Claude nenhum
envolvido. O critério é o dono, não o diretório.

**Vindo de uma versão anterior?** A memória era `.claude/c4-harness/modelagens/`.
`/cfour:setup` detecta e oferece a migração.

## Desenvolver o plugin

```sh
node scripts/verificar.mjs        # os contratos: nomes, caminhos, resíduos
```

Sem dependência e sem framework: `node --test` sobre os arquivos. O que ele
defende está no cabeçalho do próprio arquivo.

Para testar o comportamento — que é o que importa e o que nenhum teste estático
alcança — `/cfour:avaliar`. Ele custa: peça o subconjunto mínimo (`01`, `03`,
`04`, `09`, `10`, `11`), que cobre os três testes cruzados.

Um plugin instalado por marketplace é **copiado** para `~/.claude/plugins/cache`.
Para iterar sem publicar, aponte o marketplace para o clone:

```
/plugin marketplace add ./caminho/para/cfourdev-claude
```

## Licença

Proprietária — uso vinculado ao serviço cfourdev. Veja `LICENSE`.
