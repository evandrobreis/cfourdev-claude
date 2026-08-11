---
name: setup
description: Prepara um repositório para documentar arquitetura com o cfourdev — confere se o CLI `cfour` está instalado, se existe um `cfour.yaml`, se o modelo atual está válido e se há memória de uma versão anterior a migrar; explica o que falta e oferece cada passo, sem instalar nem criar nada sozinho. Use na primeira vez que alguém for documentar num repositório, quando `cfour check` não for encontrado, quando não houver `cfour.yaml`, ou quando pedirem /cfour:setup.
---

# Preparar o repositório

Este plugin conversa e opera; quem valida, desenha e publica é o CLI `cfour`, que
é outro pacote. Sem ele **não há operação nenhuma**: o plugin não tem uma segunda
implementação das regras do formato, e não vai improvisar uma.

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

Falhou? Tente `npx --no-install cfour-cli version`, que acha uma instalação local
do projeto.

| resultado | o que dizer |
|---|---|
| imprime uma versão | pronto; siga |
| não encontrado | ofereça `npm i -g cfour-cli`, e diga que `npx cfour-cli …` serve sem instalar |

**Diga também o que se perde sem ele**, porque a resposta honesta muda a decisão:
sem o `cfour` você ainda conversa sobre o software e guarda o contexto. O que some
é **tudo o que escreve e valida** — criar caixas, setas, visões e fluxos, rodar o
portão com o mesmo carregador do viewer, e o `cfour serve`, que é onde o modelo
vira desenho.

Anote a versão. Ela decide o que existe (`cfour:cli`).

### 2. Há um registro?

```bash
cfour modelagem list
```

Sem `cfour.yaml` em lugar nenhum acima do diretório atual, **relate a ausência e
não ofereça nada**. Uma linha:

```
cfour.yaml       nao existe (nasce quando o arquiteto decidir o que documentar)
```

A alternativa óbvia era oferecer aqui o `cfour init --id <slug>`, com o slug
derivado do nome do repositório. Ela perde por dois motivos objetivos. O `init`
não escreve só um registro: escreve uma modelagem mínima — um usuário, um sistema,
uma seta e um diagrama —, e **criar elementos é decisão do arquiteto**, mesmo
quando o que se cria é um esqueleto. E o `id` vai para a URL do viewer, para todo
comando e para o nome da pasta da memória: renomear depois quebra link que alguém
já compartilhou, e fixá-lo aqui é decidir no ponto de menor informação, derivando
de um nome — o do diretório — que erra justamente nos casos caros.

Se já houver registro, diga quantas modelagens ele lista e qual está `active`. Não
proponha criar mais uma: quantas realidades existem é decisão dele
(`cfour:operar`).

### 3. Há memória de uma versão anterior?

```bash
ls .claude/c4-harness/modelagens/ 2>/dev/null
```

Existe? Então este repositório foi usado antes de as skills virarem plugin, e a
memória está no endereço antigo. Ofereça a migração:

```bash
mkdir -p .claude/cfour && git mv .claude/c4-harness/modelagens .claude/cfour/history
rmdir .claude/c4-harness
```

O conteúdo é o mesmo e o `id` continua sendo o laço. Sem a migração nada quebra
visivelmente — o que é o problema: a memória antiga fica onde ninguém lê, e a
próxima sessão começa como se o trabalho fosse novo. Use `git mv` quando estiver
versionado, **confira o resultado** e diga o que foi movido.

Memória escrita por qualquer versão anterior continua legível. Blocos que não
existem mais são lidos como história, nunca como instrução
(`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/memoria.md`).

### 4. O que já existe está válido?

Havendo registro, rode o portão e relate o resultado real:

```bash
cfour check --all
```

Erro aqui não é motivo para consertar nada agora — é informação que a próxima
skill precisa. Diga o que apareceu e siga.

### 5. Há cache das capacidades da CLI?

```bash
ls .claude/cfour/cli-cache/manifest.yaml 2>/dev/null
```

Uma linha no relatório: o cache **nasce na primeira consulta**, não no setup
(`cfour:cli`). Se existir, compare o `cfour_version` dele com o do passo 1 e diga
se bate.

Se encontrar um `.claude/cfour/docs-cache/`, diga que ele é resquício de uma
versão que buscava documentação na internet — o plugin não faz mais isso — e
ofereça remover. Não o leia como fonte.

## O relatório

Um bloco, com as cinco respostas e **uma** proposta de próximo passo:

```
cfour            nao encontrado no PATH
cfour.yaml       nao existe (nasce quando o arquiteto decidir o que documentar)
memoria antiga   nao ha
modelagens       nenhuma
cache da cli     nao ha (nasce na primeira consulta)

Sem o CLI nada e escrito nem validado. Posso:

  1. instalar o cfour  npm i -g cfour-cli

Instalo? Depois disso o proximo passo e entender o que voce quer
documentar — o registro e o id nascem de la.
```

Em repositório sem registro, o setup faz **no máximo uma** oferta, e ela é
instalar o CLI. Com o `cfour` já no PATH, o relatório fica **sem oferta nenhuma**
— e isso é o certo: o próximo passo dali é uma pergunta, não um comando.

Sem acento na saída de terminal — o CLI já escreve assim, e o terminal do Windows
nem sempre está em UTF-8.

## Onde isto termina

| a situação é… | vá para |
|---|---|
| sem registro, nada documentado ainda | `cfour:contexto` |
| repositório pronto, com modelagem e memória | `cfour:sessao` |
| só faltava saber rodar o viewer, validar ou publicar | `cfour:operar` |
| dúvida sobre o que esta versão da CLI faz | `cfour:cli` |

Não comece a documentar aqui. Esta skill responde "dá para trabalhar?", e a
resposta é sim ou é uma lista do que falta — nunca um diagrama, e nunca um id.
