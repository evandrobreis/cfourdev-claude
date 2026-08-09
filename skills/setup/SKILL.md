---
name: setup
description: Prepara um repositório para modelar com o cfourdev — confere se o CLI `cfour` está instalado, se existe um `cfour.yaml`, e se há memória de uma versão anterior a migrar; explica o que falta e oferece cada passo, sem instalar nem criar nada sozinho. Use na primeira vez que alguém for modelar num repositório, quando `cfour check` não for encontrado, quando não houver `cfour.yaml`, ou quando pedirem /cfour:setup.
---

# Preparar o repositório

Este plugin escreve YAML e memória; quem valida, desenha e publica é o CLI
`cfour`, que é outro pacote. Os dois são instaláveis separadamente **de
propósito**: a modelagem funciona sem o CLI, só que sem portão e sem viewer.

Esta skill descobre o que falta, explica por que importa, e **oferece**. Ela não
instala nada, não cria arquivo e não move pasta sem um sim explícito: instalar
pacote global e escrever na raiz do repositório de alguém são atos dessa pessoa,
não seus.

## Os cinco diagnósticos, nesta ordem

Rode os cinco antes de falar. Um relatório só, com o que falta e o que já está
pronto, vale mais que cinco perguntas em sequência.

### 1. O CLI existe?

```bash
cfour version
```

Falhou? Tente `npx --no-install cfourdev version`, que acha uma instalação local
do projeto.

| resultado | o que dizer |
|---|---|
| imprime uma versão | pronto; siga |
| não encontrado | ofereça `npm i -g cfourdev`, e diga que `npx cfourdev …` serve sem instalar |

**Diga também o que se perde sem ele**, porque a resposta honesta muda a
decisão: sem o `cfour` você ainda descobre propósito, decide estratégia,
escreve YAML e guarda memória. O que some é o **portão** — validar o que foi
escrito com o mesmo carregador do viewer — e o `cfour serve`, que é onde o
modelo vira desenho. Sem portão, toda afirmação sua sobre correção técnica passa
a ser leitura, e leitura não é validação.

### 2. Há um registro?

```bash
cfour check --all
```

Sem `cfour.yaml` em lugar nenhum acima do diretório atual, **relate a ausência e
não ofereça nada**. Uma linha, no mesmo tom que o passo 5 usa para o cache:

```
cfour.yaml       nao existe (nasce quando o assunto tiver nome)
```

A alternativa óbvia era oferecer aqui o `cfour init --id <slug>`, com o slug já
derivado do nome do repositório — e era o que esta skill mandava fazer. Ela
perdeu por dois motivos. O `init` não escreve só um registro: escreve uma
modelagem mínima em `./<slug>/` — um usuário, um sistema, uma seta e um diagrama
—, e estrutura antes de propósito é exatamente o que este plugin existe para não
fazer, mesmo quando a estrutura é um esqueleto. E o `id` é a decisão mais cara da
modelagem: vai para a URL do viewer, para todo comando e para o nome da pasta da
memória, e renomear depois quebra link que alguém já compartilhou. Fixá-lo no
diagnóstico é decidir isso no ponto de **menor** informação, derivando de um nome
— o do diretório — que erra justamente nos casos que mais custam: duas frentes no
mesmo repositório, uma modelagem que não é o repositório, um produto com outro
nome.

O `id` continua sendo **proposto, e nunca perguntado**; isso não mudou. Mudou
**quando**: ele se propõe assim que o assunto tem nome, o que acontece em
`cfour:descoberta`, e o registro nasce em seguida por `cfour:modelagens`
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/decisoes-de-quem.md`).

Se já houver registro, apenas diga quantas modelagens ele lista e qual está
`active`. Não proponha criar mais uma: quando é modelagem nova e quando é
projeto na existente é assunto de `cfour:modelagens`, e a resposta quase nunca é
a primeira.

### 3. Há memória de uma versão anterior?

```bash
ls .claude/c4-harness/modelagens/ 2>/dev/null
```

Existe? Então este repositório foi modelado com o harness antes de ele virar
plugin, e a memória está no endereço antigo. Ofereça a migração, **com o
porquê**:

```bash
mkdir -p .claude/cfour && git mv .claude/c4-harness/modelagens .claude/cfour/history
rmdir .claude/c4-harness
```

O nome mudou porque nomeava um *harness* que era uma pasta de um repositório e
virou um plugin; o conteúdo é o mesmo e o `id` continua sendo o laço. Sem a
migração nada se perde e nada quebra visivelmente — o que é justamente o
problema: a memória antiga fica onde ninguém lê, e a próxima sessão começa como
se a modelagem fosse nova.

Use `git mv` quando o diretório estiver versionado, para o histórico acompanhar.
**Confira o resultado** e diga o que foi movido.

### 4. O que já existe está válido?

Havendo registro, rode o portão e relate o resultado real:

```bash
cfour check --all
```

Erro aqui não é motivo para consertar nada agora — é informação que a próxima
skill precisa. Diga o que apareceu e siga.

### 5. Há cache da documentação?

```bash
ls .claude/cfour/docs-cache/manifest.yaml 2>/dev/null
```

Uma linha no relatório, e nada mais: o cache **nasce na primeira consulta**, não
no setup (`cfour:documentacao`). Baixar documentação que ninguém pediu é
exatamente o download integral que a política proíbe.

Se ele já existir, diga a data da última verificação. Se não existir, diga que
será criado quando for preciso, e que ele vai para o git junto com a memória —
quem preferir cache descartável acrescenta `.claude/cfour/docs-cache/` ao
`.gitignore`, e nada quebra.

## O relatório

Um bloco, com as cinco respostas e **uma** proposta de próximo passo:

```
cfour            nao encontrado no PATH
cfour.yaml       nao existe (nasce quando o assunto tiver nome)
memoria antiga   nao ha
modelagens       nenhuma
cache da doc     nao ha (nasce na primeira consulta)

Sem o CLI voce ainda modela: o que some e a validacao e o viewer
local. Posso:

  1. instalar o cfour  npm i -g cfourdev

Instalo? Depois disso o proximo passo e descobrir o que a modelagem
precisa apoiar — o id e o registro nascem de la, ja com nome.
```

Em repositório sem registro, o setup faz **no máximo uma** oferta, e ela é
instalar o CLI. Com o `cfour` já no PATH, o relatório fica **sem oferta nenhuma**
— e isso é o certo, não uma falha: o próximo passo dali é uma pergunta, não um
comando. Duas propostas, sendo que uma delas grava um identificador que vai para
a URL, é este passo decidindo o que ele não tem informação para decidir.

Sem acento na saída de terminal — o CLI já escreve assim, e o terminal do
Windows nem sempre está em UTF-8.

## Onde isto termina

Com o repositório pronto, o trabalho é de outra skill, e não desta:

| a situação é… | vá para |
|---|---|
| sem registro, nada modelado ainda | `cfour:descoberta` — é lá que o assunto ganha nome, e só então o `id` |
| repositório pronto, com modelagem e memória | `cfour:retomar` |
| dúvida sobre em qual realidade trabalhar | `cfour:modelagens` |
| só faltava saber rodar o viewer ou publicar | `cfour:operar` |

Não comece a modelar aqui. Esta skill responde "dá para trabalhar?", e a resposta
é sim ou é uma lista do que falta — nunca um diagrama, e nunca um id.
