---
name: operar
description: Traduz o que o arquiteto pede em linguagem natural para comandos da CLI cfour e executa — cria e altera elementos, relações, notas, diagramas, fluxos e projetos, consulta o modelo, confere com cfour check, abre o viewer e publica. Use sempre que houver um pedido para mexer no modelo, ver os diagramas, validar, revisar o que existe ou publicar na plataforma.
---

# Operar — a Fase B

O arquiteto diz o que quer, em português. Você descobre qual comando representa
**a decisão que ele já tomou**, executa, valida e relata. Ele não precisa decorar
nem digitar comando nenhum.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`.

> **A CLI é a API.** Havendo comando oficial equivalente, é o comando que se usa.
> **Não havendo, a operação não acontece**: você nomeia o comando que falta e
> para. Não existe caminho manual.

## O ciclo, para qualquer pedido

1. **A intenção está inequívoca?** Se materializá-la exigir uma decisão
   arquitetural ou semântica que ninguém tomou, **pergunte antes** (abaixo).
2. **Há contradição com o C4?** Confira em
   `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/c4.md` e, se houver, relate
   objetivamente e peça confirmação — sem trocar a classificação por conta própria.
3. **Qual é o comando?** As capacidades reais estão em `cfour:cli`. Não invente
   flag — e, principalmente, **não conclua de memória que um comando não
   existe**: é essa afirmação que produz edição manual. Confira em
   `cfour help <família>` ou `cfour <comando> --help` antes de dizer que não dá.
4. **Mostre o efeito** com `--dry-run`, em toda operação que escreve e não é
   trivial — e sempre nas que removem ou renomeiam.
5. **Execute.**
6. **Valide** com `cfour check --modelagem <id>` e relate o resultado **real**,
   inclusive quando reprova.
7. **Registre** em `$MEM/session.yaml`: `last_operation`, `touched_files`,
   `next_step`.

## Passo 1 — o que é seu, e o que é dele

| você resolve sozinho | você pergunta antes |
|---|---|
| qual comando e quais flags · derivar um id de um nome já dito · reaproveitar um id que existe · em qual arquivo gravar · a ordem das operações · rodar a validação | qual abstração C4 · qual `parent` · o que é fronteira, domínio ou dono · quantos projetos ou modelagens · quais diagramas devem existir · o que remover |

Cinco casos, para fixar a fronteira:

> **"Temos um módulo de autorização compartilhado."**
> Não crie nada. Falta o fato que decide a abstração: *"ele roda como aplicação
> separada, é um datastore, ou é código dentro de outra aplicação? E em que nível
> você quer representá-lo?"*

> **"O `identity-bff` é um Container. Adicione dentro do sistema Identity."**
> A decisão está tomada e não contradiz nada conhecido. **Execute** —
> `cfour element add identity-bff --parent identity …` — valide e relate. Não
> transforme isto de novo em conversa de arquitetura.

> **"Esse conjunto de classes roda dentro do mesmo processo da API, mas quero
> cadastrar como Container."**
> Diga o conflito com a definição de Container, pergunte se ele confirma mesmo
> assim, e espere. Se confirmar, execute e registre que foi decisão informada.
> **Não** troque para Component.

> **"Adicione uma relação HTTPS do portal para o BFF."**
> As duas pontas estão identificadas sem ambiguidade. **Execute**
> `cfour relation add portal bff --label HTTPS`. Não faça pergunta arquitetural
> irrelevante. (Se houver dois candidatos a "portal", aí sim pergunte **qual** —
> isso é ambiguidade de referência, não de arquitetura.)

> **"Como você acha que eu deveria quebrar meus microsserviços?"**
> Este não é o papel do plugin. Diga isso em uma frase, sem sermão, e ofereça o
> que você faz: registrar no modelo a decomposição que ele decidir, e mostrar o
> que o modelo já afirma hoje.

## Escrever

A família de comandos, com a forma canônica. **As opções de cada um vêm de
`cfour:cli`** — o que está aqui é o mapa, não o contrato.

| o arquiteto quer | o comando |
|---|---|
| uma caixa nova | `cfour element add <id> --parent <ref> --shape <forma> --name … --technology … --description …` |
| mudar uma caixa | `cfour element set <ref> --name … --technology …` |
| renomear uma caixa | `cfour element mv <ref> <novo-id>` — conserta quem apontava para ela |
| remover uma caixa | `cfour element rm <ref>` — **recusa** se alguém depender dela, e lista quem |
| uma seta | `cfour relation add <origem> <destino> --kind … --label …` |
| tirar uma seta | `cfour relation rm <origem> <destino>` |
| um recado numa caixa | `cfour note add <alvo> "<texto>" --kind risk\|question\|blocker\|warning\|info\|tip` |
| tirar um recado | `cfour note rm <alvo> --texto "<trecho>"` — o `--texto` desempata quando a caixa tem mais de um |
| uma visão estrutural | `cfour diagram add <id> --scope <ref> --title …` |
| um caso de uso em sequência | `cfour flow add <id> <origem> <destino> --title …`, depois `cfour flow step <fluxo> <destino> --label …` |
| uma pasta que agrupa | `cfour project add <id> --name …` |
| um tipo novo de seta, nota, forma ou desfecho | `cfour config set <registro> <chave> --label …` |
| dar nome legível a uma chave de `meta`, ou liberar a cor | `cfour config set metadata <chave> --label … --color …` |

O que vale saber ao montar:

- **`--parent` é o que decide o nível C4.** Não existe `--level` em elemento, e
  declarar nível à mão contraria a árvore. Por isso o `--parent` é sempre decisão
  do arquiteto.
- **`--dry-run` mostra o patch e não grava nada**, em qualquer comando que
  escreve. Use antes de remover, renomear e de qualquer operação em lote.
- **A CLI não reserializa o arquivo**: ela acha o ponto e emenda, então
  comentários e formatação do que o arquiteto escreveu à mão continuam onde
  estavam. E ela **não grava nada que não carregue** — erro novo desfaz a
  gravação.
- **Um diagrama seleciona, e não lista.** `--scope X` sem `--include` mostra os
  filhos de X, e uma caixa nova entra sozinha. Listar membro a membro produz um
  desenho que congela — se o arquiteto quiser o conjunto fechado, ele pede.
- **Um fluxo não cria caixa nenhuma**, e nasce já com o primeiro passo. Depois de
  mexer em fluxo, rodar o check **não é opcional**: um fluxo com erro não carrega
  inteiro, e o sintoma é `0 fluxo(s)` sem nada apontando o passo culpado.
- **Reaproveite.** Antes de criar, procure: `cfour find <termo>` e
  `cfour element list`. Caixa duplicada com nome diferente é o erro mais caro.
- **Uma alteração nunca toca duas modelagens.** Não existe seta direta entre
  modelagens: o que atravessa é um espelho (`cfour element add --bind`), declarado
  um por vizinho. Se o pedido parece exigir isso, **diga o custo e pergunte**.

## Consultar

```bash
cfour find <termo> [--tipo element|relation|diagram|flow] [--json]
cfour refs <ref> [--json]                       # onde uma caixa é usada
cfour element show <ref> [--json]               # tudo sobre ela, e quem aponta
cfour element list [--projeto …] [--level …] [--shape …] [--tag …]
cfour relation list [--from …] [--to …]
cfour diagram list · cfour flow list · cfour flow show <ref> · cfour project list
cfour check --modelagem <id> --inventory --json # o inventário inteiro
```

Consulte **antes** de perguntar: o modelo responde sozinho quantas caixas
existem, quem aponta para quem e o que já tem id.

## Conferir o modelo

Quando pedirem para revisar, validar ou "ver se está bom":

**1. Correção técnica — delegada, nunca inferida.**

```bash
cfour check --modelagem <id> --json
```

Reporte erros e avisos **como o comando os deu**, com arquivo. Não classifique por
leitura o que a ferramenta classifica melhor, e não silencie aviso preexistente
por parecer ruído: `passo de fluxo sem seta declarada` e `conteúdo inalcançável`
são achados de verdade.

**2. Consistência referencial** — o que o inventário mostra e o check não chama de
erro: id fora do padrão que o arquiteto declarou · relação apontando para caixa
que sumiu · hierarquia que contraria uma decisão registrada · chave de `meta`
escrita de dois jeitos · caixa com filhos e sem diagrama de `scope` (conteúdo
inalcançável) · `metadata` sem `color: true` numa chave que o arquiteto queria
colorida · nota órfã.

**3. Coerência com a definição C4** — e só como **pergunta**:

> ✅ "`motor-de-regras` está modelado como Container, e o que está registrado
> sobre ele é que roda dentro do processo da API. Isso conflita com a definição de
> Container. Confirmo como está, ou o `parent` deveria mudar?"

> ❌ "Isso não é Container; vou transformar em Component."

**O que não se faz aqui:** julgar a arquitetura. Nada de responsabilidades demais
numa caixa, acoplamento, ownership, resiliência, se falta um fluxo, se a visão
comunica bem, se há caixas de mais. **O plugin não é ferramenta de revisão de
arquitetura.**

Ofereça as correções; não as aplique sem combinar. Correção de modelagem muda o
que o desenho **afirma**.

## O registro de modelagens

```bash
cfour modelagem list [--json]      # as realidades registradas
cfour init --id <slug> --nome "…"  # cria a menor modelagem que desenha algo
```

Quantas modelagens existem, e se algo novo é outra realidade ou mais uma parte da
que está aberta, **é decisão do arquiteto**. O que é seu: derivar o slug de um
nome que ele já disse, e dizer o que ele custa — o `id` vai para a URL do viewer,
para todo comando e para o nome da pasta da memória, e renomear depois quebra
link que alguém já compartilhou.

Trocar a ativa: `active:` no `cfour.yaml` muda de vez (vai para o git);
`C4_MODELAGEM=<id>` vale para um comando; `C4_ROOT=<pasta>` vence os dois e não
registra nada. **Ao trocar, anuncie** e recarregue a memória da nova — contexto,
convenções e decisões da anterior deixam de valer inteiramente.

Registrar uma modelagem que já existe — uma pasta com `model/` e
`modelagem.yaml` que não está no registro — **não tem comando**: o `cfour init`
cria uma modelagem nova, e não registra a que existe. É uma linha no
`cfour.yaml`, e quem a escreve é o arquiteto. Diga qual é a linha, diga que a
memória **não vem junto** — ela nasce vazia aqui —, e pare.

Tirar do registro **não apaga nada**, e é assim que deve ser. Apagar arquivo é ato
do arquiteto, nunca seu.

## Ver — `cfour serve`

```bash
cfour serve [--modelagem <id>] [--port 5173]
```

Sobe o viewer lendo o disco. **Ele fica rodando**: rode em segundo plano, diga a
URL, e siga a conversa — não fique esperando um processo que não termina.

Arrastar uma caixa salva em `<projeto>/.layout/<diagrama>.json`, e esse arquivo
vai para o git — é o único caminho de escrita do viewer. **O YAML nunca é
reescrito por ele**: se pedirem "muda pelo navegador", a resposta é que não
existe.

Com o viewer aberto, salvar um arquivo já recarrega a tela: vale pedir ao
arquiteto para olhar o desenho. O risco real de modelo gerado por IA é o desenho
**plausível e errado**, e isso só a leitura humana pega.

## Publicar

| | comandos | efeito |
|---|---|---|
| **local** | `check`, `serve`, e tudo que escreve no modelo | não sai da máquina |
| **credencial** | `login`, `logout`, `use` | escreve ou apaga uma chave em disco |
| **publicado** | `push` | muda o que a organização inteira lê |

**Confirme antes de `login` e de `push`.** E **sempre ofereça o ensaio primeiro**:

```bash
cfour push --dry-run     # compila, valida e mostra o que subiria, sem enviar
cfour push [--ref <nome>] [--all] [--profile <nome>]
cfour status [--json]    # o que está publicado, e com qual chave
cfour keys [--json]      # as chaves guardadas, e qual vale aqui
```

- **A chave nunca aparece na conversa.** Não peça para colarem aqui, não repita o
  valor, não escreva num arquivo. Peça que rodem o `login` no terminal, ou
  exportem `CFOUR_KEY`. Se uma chave chegar mesmo assim, diga que ela precisa ser
  revogada e regerada, e siga sem ela. Em CI é `CFOUR_KEY`, sempre.
- **Havendo mais de uma chave, rode `cfour keys` antes de sugerir `push`**:
  publicar no destino errado é reversível e constrangedor.
- Só sobem as modelagens com `status: active`; modelagem cujo `path` aponta para
  fora do repositório **não é publicada**; a ref sai do git, e `HEAD` destacado
  falha pedindo `--ref`.

## Quando um comando falha

Leia a mensagem e **repita-a literalmente**. O CLI erra falando, e a saída dele é
mais confiável do que a sua leitura do YAML.

| sintoma | quase sempre é |
|---|---|
| a remoção foi recusada | alguém aponta para a caixa — a recusa lista quem, com o arquivo |
| `nenhuma modelagem para publicar` | tudo com `status: reference`, ou nada `active` |
| não determina a ref | `HEAD` destacado; passe `--ref` |
| `nenhuma chave configurada` | falta `login`, ou `CFOUR_KEY` no ambiente |
| a pasta da modelagem não existe | `path:` no registro aponta para o que foi movido |
| registro não encontrado | está fora do repositório, ou falta `cfour init` → `cfour:setup` |
| opção desconhecida | a flag não existe **nesta** versão → `cfour:cli` |

Nunca invente um resultado que você não viu: se o comando não rodou, diga que não
rodou. Sem acento na saída de terminal — o CLI já escreve assim, e o terminal do
Windows nem sempre está em UTF-8.

## Quando não existe comando

Acontece: o formato do C4Dev aceita coisas que esta versão da CLI ainda não
escreve. **Isso não abre exceção** — abre um relato.

1. **Confirme que o comando não existe**, no help da CLI instalada e nunca de
   memória: `cfour help <família>`, `cfour <comando> --help`, ou o cache em
   `cfour:cli`. A maior parte das edições manuais nasce aqui, num comando que
   existia e ninguém procurou.
2. **Tente dizer a mesma coisa com o que existe**, e diga o que isso custa
   quando custa: refazer uma nota é `cfour note rm` seguido de `cfour note add`,
   e o texto anterior não volta sozinho. Mostre o `--dry-run` antes.
3. **Não havendo caminho, relate e pare** — sempre nesta forma, para a lacuna
   virar item de backlog da CLI sem ninguém precisar reconstruir o caso:

   ```
   nao existe comando para isto no cfour <versao>:
     <o comando ou a flag que faltou>

   a operacao pedida   <o que foi pedido, em uma linha>
   o campo do formato  <o que seria escrito>
   o arquivo           <onde ele moraria>

   nao vou editar o arquivo. voce decide o que fazer.
   ```

4. **Não abra o arquivo para escrever** — nem para "só um campo", nem depois de
   o arquiteto dizer que tudo bem. Quem decide o que fazer com a lacuna é ele,
   inclusive editar com as próprias mãos, que é direito dele e não seu.

Para descrever o campo no relato, confira em
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/formato.md` e, na dúvida, em
`cfour help formato`. **Campo inventado não falha: ele desaparece** — e num
relato ele manda o arquiteto escrever algo que o carregador vai ignorar.

## O que nunca fazer aqui

- Criar, alterar ou remover qualquer coisa cuja abstração, `parent` ou existência
  o arquiteto não tenha decidido.
- Trocar a classificação de um elemento por achar que ela está errada.
- Escrever no modelo, na identidade da modelagem ou no registro por fora da CLI
  — existindo comando ou não.
- Concluir que não existe comando sem ter conferido no help da CLI instalada.
- Apagar um aviso mudando o desenho em vez da causa.
- Rodar `push` ou `login` sem confirmação.
- Relatar que validou sem ter rodado o `check`.
- Registrar no modelo o que ainda é evidência não confirmada — isso fica no
  `project-context.yaml`.
