# cfour — modelagem C4 conversando, no Claude Code

Diagrama de arquitetura desenhado à mão apodrece: mora fora do código, não passa
por revisão, e ninguém percebe quando deixa de ser verdade.

O [cfourdev](https://cfourdev.com.br) resolve metade disso — o modelo vira YAML
versionado, com pull request e histórico, e um viewer o desenha. Sobra a metade
difícil, que é **decidir o que vale a pena representar**. É o que este plugin faz.

> O formato é aberto e documentado em
> [cfourdev.com.br/docs](https://cfourdev.com.br/docs/), sem login. É de lá que
> as skills tiram cada regra do YAML que escrevem, e é lá que você confere o que
> elas afirmam.

Ele não gera diagramas a partir do que você pediu. Ele pergunta que decisão os
desenhos precisam apoiar, para quem, e o que acontece quando dá errado — e só
então escreve. A conversa é o produto; o YAML é a consequência.

## Como é na prática

```
Você  → Vamos modelar a plataforma de pagamentos. Já pode montar o C4?

cfour → Antes de montar: que decisão ou conversa esses diagramas precisam
        apoiar? "Documentar a arquitetura" ainda não é resposta — tem alguma
        discussão chegando que o desenho destravaria?

        E "plataforma" aqui quer dizer o quê? Tem alguém fora do seu time que
        integra com vocês e pode dizer "não"?
```

Três ou quatro rodadas depois, sai uma estratégia justificada — com a alternativa
que foi considerada e a condição que a faria mudar —, o YAML escrito e validado,
e um registro no repositório do que virou fato, do que ainda é hipótese e do que
continua sendo pergunta.

## Instalar

```
/plugin marketplace add evandrobreis/cfourdev-claude
/plugin install cfour@cfourdev
```

Depois, num repositório onde você queira modelar:

```
/cfour:setup
```

Ele confere o que falta e propõe cada passo. Daí em diante as skills se chamam
entre si — você conversa, não escolhe comando.

### Instalar sem publicar, para desenvolver

Um plugin instalado por marketplace é **copiado** para
`~/.claude/plugins/cache`, então editar os arquivos aqui não muda o que está
rodando. Para iterar, aponte o marketplace para o clone:

```sh
git clone git@github.com:evandrobreis/cfourdev-claude.git
```

```
/plugin marketplace add ./cfourdev-claude
/plugin install cfour@cfourdev
```

`/plugin marketplace update cfourdev` recarrega depois de uma edição.

### Para um time inteiro

No `.claude/settings.json` do repositório de vocês, e quem clonar já recebe sem
digitar nada:

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

## O CLI, que é outro pacote

```sh
npm i -g cfourdev
```

O plugin decide e escreve; o `cfour` **valida e desenha**. São dois instaláveis
porque fazem coisas diferentes — e você pode querer o CLI sem nunca abrir o
Claude Code. O que ele faz, comando a comando, está na
[documentação](https://cfourdev.com.br/docs/) e não aqui: duplicar a referência
de um CLI que sobe de versão sozinho é escrever a mesma coisa em dois lugares
para que um deles minta depois.

Sem o `cfour` instalado, o plugin ainda conversa e ainda escreve YAML. O que não
acontece:

- **nada confere o que foi escrito.** `cfour check` carrega o modelo com o mesmo
  código que o viewer usa e diz o que está quebrado. Sem ele, o plugin só pode
  dizer "parece certo", que não é a mesma coisa;
- **você não vê o diagrama.** `cfour serve` abre o viewer no navegador, e
  arrastar uma caixa salva a posição num arquivo que vai para o git;
- **não dá para publicar.** `cfour push` sobe o modelo para a plataforma.

`/cfour:setup` detecta a ausência e oferece instalar.

## Onde as coisas ficam no seu repositório

```
cfour.yaml                     o registro: quais modelagens existem
<path do registro>/            o modelo — o que o viewer desenha
  modelagem.yaml
  model/
.claude/cfour/history/<id>/    a memória: contexto, sessão, decisões
```

Uma **modelagem** é uma realidade: propósito, audiência, vocabulário e memória
próprios. Um arquiteto costuma manter várias em paralelo, e elas não se
misturam.

Tudo isso vai para o git — inclusive a memória. É o que permite revisar uma
mudança de arquitetura em pull request com o desenho, o porquê e o histórico no
mesmo commit.

A memória mora sob `.claude/` porque é escrita aqui, por este plugin; o
`cfour.yaml` mora na raiz porque quem o escreve é o `cfour init`, sem Claude
nenhum envolvido. O critério é o dono, não o diretório.

> **Vindo de uma versão anterior?** A memória ficava em
> `.claude/c4-harness/modelagens/`. `/cfour:setup` detecta e oferece a migração.

## As treze skills

Você não precisa decorar isto — o núcleo roteia sozinho. Serve para saber o que
existe.

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
quem fala, não a arquitetura de quem escuta.

Duas iniciativas com o mesmo rótulo devem poder receber estratégias
**diferentes**; duas com rótulos diferentes devem poder receber a **mesma**,
quando as necessidades coincidem. Se o rótulo decidiu a estrutura, o plugin
falhou.

Isso não é declaração de intenção: é o que `cfour:avaliar` mede, com onze
cenários e três testes cruzados — dois pares que usam vocabulário parecido para
necessidades opostas, e um par que precisa dar respostas diferentes para dois
casos que *parecem* o mesmo.

## Desenvolver

```sh
node --test scripts/verificar.mjs
```

Os contratos: nomes de skill contra nomes de diretório, todo caminho citado que
tem de existir, as marcas `doc:` contra a lista de documentos publicados, e o
resíduo que uma substituição mecânica deixa. Sem dependência e sem framework — o
repositório inteiro é prosa, e é a prosa que é o contrato.

Comportamento nenhum teste estático alcança. Quem mede é `/cfour:avaliar`, que
custa: peça o subconjunto mínimo (`01`, `03`, `04`, `09`, `10`, `11`), que cobre
os três testes cruzados.

## Licença

Proprietária — uso vinculado ao serviço cfourdev. Veja `LICENSE`.
