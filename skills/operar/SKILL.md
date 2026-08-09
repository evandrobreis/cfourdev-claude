---
name: operar
description: Opera o repositório de modelagens com o CLI cfourdev — abre o viewer local, valida tudo, guarda a chave, publica na plataforma e mostra o que está publicado. Use quando pedirem para ver os diagramas no navegador, rodar a validação completa, publicar uma modelagem, conferir o que já subiu, ou quando um comando `cfour` falhar e for preciso entender por quê.
---

# Operar com o `cfour`

Modelar produz YAML; olhar, validar e publicar é o CLI. Esta skill é a ponte, e
existe porque os comandos têm efeitos de tamanhos muito diferentes: `serve` abre
uma aba, `push` muda o que a organização inteira lê.

Sem o `cfour` no PATH → `cfour:setup`. Não improvise um substituto.

## A divisão que importa

| | comandos | efeito |
|---|---|---|
| **local** | `check`, `serve` | não sai da máquina; rode à vontade |
| **credencial** | `login`, `logout` | escreve/apaga uma chave em disco |
| **publicado** | `push` | muda o que todo mundo da organização vê |

**Confirme antes de `login` e de `push`.** As duas últimas linhas não são
reversíveis do lado de cá: uma grava segredo no disco de alguém, a outra
substitui o que está no ar para a ref publicada.

## Ver o modelo — `cfour serve`

```bash
cfour serve                       # a modelagem active
cfour serve --modelagem <id>
cfour serve --port 5173
```

Sobe o viewer lendo o disco. **Arrastar uma caixa salva** em
`<projeto>/.layout/<diagrama>.json`, e esse arquivo vai para o git — é o único
caminho de escrita do sistema, e é de propósito: o arranjo é trabalho
comunicativo e merece revisão como o resto.

Ele fica rodando. Rode em segundo plano, diga a URL, e siga a conversa; não fique
esperando o processo terminar, porque ele não termina.

O modelo YAML **nunca** é reescrito pelo viewer. Se alguém pedir "muda pelo
navegador", a resposta é que não existe: as caixas vêm do arquivo.

## Validar tudo — `cfour check --all`

```bash
cfour check --all
```

Uma modelagem por vez é o portão de quem está escrevendo (`cfour:modelagem`).
`--all` é o de quem está fechando: carrega todas e é a única forma de conferir
**espelhos** entre modelagens — a outra ponta de um `bind` só pode ser
verificada com as duas na mão.

Sai com código 1 quando há erro. Aviso não reprova, e não deve virar tarefa por
si: um modelo em meio de conversa tem avisos, um modelo quebrado tem erros.

## Guardar a chave — `cfour login`

```bash
cfour login --key c4_<id>_<segredo>
```

Grava em `$XDG_CONFIG_HOME/cfour/credentials`, modo `0600`.

**A chave nunca aparece na conversa.** Não peça para colarem aqui, não repita o
valor, não escreva num arquivo. Peça que rodem o `login` no terminal, ou que
exportem `CFOUR_KEY`. Se uma chave chegar mesmo assim, diga que ela precisa ser
revogada e regerada, e siga sem ela.

Em CI é `CFOUR_KEY` no ambiente, sempre: o `login` grava em disco, o que é a
coisa errada num runner compartilhado.

`cfour logout` esquece uma chave; `cfour logout --all`, todas.

### Mais de uma chave na mesma máquina

**Uma chave carrega a organização e o repositório dela — uma chave é um
repositório.** Quem mantém dois destinos guarda os dois, e o `login` nomeia cada
um pelo destino:

```bash
cfour keys                  # o que esta guardado, e qual vale aqui
cfour keys --json
cfour use <perfil>          # troca a chave DESTE repositorio
cfour use <perfil> --default  # troca a que vale onde nao houver vinculo
```

`cfour login --profile <nome>` guarda sob outro nome que não o do destino, e
`push` e `status` aceitam `--profile <nome>` para rodar com uma chave que não é a
deste repositório. O vínculo repo → perfil sai do `id:` do `cfour.yaml`, que vai
versionado e não é segredo; o vínculo em si é local, porque nome de perfil é
escolha de quem trabalha e não do time.

**Antes de sugerir `push`, rode `cfour keys` quando houver mais de uma chave.**
Publicar no destino errado é reversível e constrangedor, e o `push` só mostra o
destino na hora — `destino: acme/plataforma · ref "main" · perfil …`.

## Publicar — `cfour push`

**Sempre ofereça o ensaio primeiro:**

```bash
cfour push --dry-run
```

Ele compila, valida e mostra o que subiria — quantos elementos, quantos layouts,
o tamanho — sem enviar nada e sem precisar de chave.

```bash
cfour push                        # as modelagens com status: active
cfour push --ref <nome>           # a ref publicada, quando o git não disser
cfour push --all                  # inclui as que não estão active
cfour push --profile <nome>       # com outra chave que não a deste repositório
```

O que vale saber antes de rodar:

- só sobem as modelagens com `status: active`. `reference` e `archived` ficam,
  e o comando diz quais pulou e por quê;
- **modelagem cujo `path` aponta para fora do repositório não é publicada.**
  Publicar de uma cópia de trabalho que ninguém revisou é exatamente a
  divergência que a ferramenta existe para impedir;
- tudo é compilado e validado **antes** de qualquer upload. Um push que publica
  metade e falha deixaria o site descrevendo um estado que nunca existiu;
- a ref sai do git. `HEAD` destacado — comum em CI — falha pedindo `--ref`, em
  vez de publicar tudo sob um nome inventado;
- publicar na branch principal exige ser admin; qualquer pessoa publica a branch
  em que estiver, como preview. É a mesma regra que a equipe já tem no git.

`--all` só quando pedirem: ele contraria o `status` que alguém escreveu de
propósito.

## O que está no ar — `cfour status`

```bash
cfour status
cfour status --json
cfour status --profile <nome>
```

Diz o que está publicado e com qual chave — mascarada, e dizendo de qual perfil
ela veio. É a primeira coisa a rodar quando
alguém diz "no site está diferente": quase sempre a resposta é uma ref antiga, e
não um defeito de desenho.

## Quando um comando falha

Leia a mensagem e repita-a, literalmente. O CLI erra falando — e a saída dele é
mais confiável do que a sua leitura do YAML.

| sintoma | quase sempre é |
|---|---|
| `nenhuma modelagem para publicar` | tudo com `status: reference`, ou nada `active` |
| não determina a ref | `HEAD` destacado; passe `--ref` |
| `nenhuma chave configurada` | falta `login`, ou `CFOUR_KEY` no ambiente |
| a pasta de modelagem não existe | `path:` no registro aponta para o que foi movido |
| registro não encontrado | está fora do repositório, ou falta `cfour init` → `cfour:setup` |

Sem acento na saída de terminal, e nunca invente um resultado que você não viu:
se o comando não rodou, diga que não rodou.
