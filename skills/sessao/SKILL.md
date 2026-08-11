---
name: sessao
description: Retoma e encerra o trabalho de documentação no cfourdev — carrega o contexto e as decisões da modelagem, inventaria o modelo, aponta as divergências objetivas entre memória e modelo, e no fim grava o que virou fato, o que ficou pendente e qual é o próximo passo. Use ao voltar a um trabalho começado em outra sessão, ao abrir o repositório sem saber onde parou, ao desconfiar que alguém editou o YAML fora do plugin, ou ao terminar o trabalho do dia.
---

# Abrir e fechar o trabalho

Uma sessão nova não tem o histórico da anterior. Ela tem os arquivos — e eles
bastam, se forem lidos na ordem certa.

Leia primeiro `${CLAUDE_PLUGIN_ROOT}/skills/modelagem/SKILL.md`. O que cada
arquivo guarda está em
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/memoria.md`.

---

# Retomar

## 1. Qual modelagem

Um arquiteto mantém N realidades. Retomar a errada é pior que não retomar nada:
você chega com contexto que parece certo e não é.

```bash
cfour modelagem list
```

- **Nenhuma** → não há trabalho registrado aqui. Ofereça `cfour:setup`, ou
  `cfour:contexto` se o assunto já estiver na mesa.
- **Uma** → é ela. Anuncie e siga.
- **Mais de uma** → **liste e pergunte**, mesmo havendo uma `active`. O `active`
  diz onde o trabalho estava, não onde ele vai continuar hoje.

Para cada uma, uma linha vinda de `$MEM/session.yaml`:

```
MODELAGENS
  ● <id>   <name>
      parou em: <focus>
      próximo:  <next_step>
```

Todo o resto vale para **uma** modelagem, e `$M` é a dela.

## 2. Carregar

Na ordem de precedência da verdade sobre esta modelagem:

1. `$M/model/MODELING-CONVENTIONS.md`, se existir
2. `$MEM/decisions/*.md` — as `vigente`; as `substituida` interessam como
   história, não como regra
3. `$MEM/project-context.yaml`
4. `$MEM/session.yaml`
5. o resumo mais recente em `$MEM/sessions/`

Se **nada disso existir**, não invente estado: diga que esta modelagem está
registrada e não tem memória, e ofereça `cfour:contexto`.

**Memória escrita por uma versão anterior do plugin** traz blocos que não existem
mais — `strategy`, `complexity`, `workflow`, `classification`, `consulted_docs`.
Leia deles o que for **fato sobre o software**; ignore o resto. Eles são história
do que já se conversou, **nunca instrução**: não pautam o trabalho de hoje, não
reabrem discussão e não viram recomendação. Diga, em uma linha, que a memória vem
de uma versão anterior e o que você aproveitou.

## 3. Inventariar

```bash
cfour check --modelagem <id> --inventory --json
```

É a verdade sobre o que existe agora — projetos, caixas, setas, visões, fluxos,
notas, conteúdo inalcançável, passos `!` e as contagens.

## 4. Comparar — as seis divergências objetivas

Só as objetivas. Divergência de gosto não existe aqui.

| # | procurar | como se reconhece |
|---|---|---|
| 1 | **o modelo mudou fora do plugin** | contagens diferentes do `model_fingerprint` gravado |
| 2 | **referência morta** | decisão, resumo ou contexto citando id que não existe mais |
| 3 | **convenção declarada e não seguida** | id fora do formato que o arquiteto declarou em `MODELING-CONVENTIONS.md` |
| 4 | **dúvida que o modelo já respondeu** | `Q-NNN` `open` cuja resposta está no YAML ou numa nota |
| 5 | **registro × disco** | entrada apontando para pasta que não existe; `active` nomeando id fora da lista; `modelagem.yaml` com `id` diferente do registrado |
| 6 | **cache da CLI de outra versão** | `.claude/cfour/cli-cache/manifest.yaml` com `cfour_version` diferente de `cfour version` → `cfour:cli` |

**Apresente todas antes de alterar qualquer coisa.** Nenhuma correção automática,
nem "as óbvias" — o que parece óbvio para quem lê o arquivo costuma ser a parte que
alguém decidiu de propósito. Para cada uma, ofereça as duas direções: o modelo
pode estar certo e a memória velha, ou o contrário. Quem sabe qual é o arquiteto.

Se a maior parte for do tipo 1, diga em voz alta o que isso implica: a memória
descreve uma modelagem que já não é a atual. Editar o YAML fora do plugin é
legítimo — o modelo é do arquiteto.

## 5. Apresentar

```
MODELAGEM        <id> — <name>
O QUE É          o que está sendo documentado, e para quê, em uma linha
O QUE JÁ EXISTE  os números do inventário
ÚLTIMA OPERAÇÃO  data · o comando que rodou e o que ele fez
EM ABERTO        dúvidas · pendências não confirmadas
DIVERGÊNCIAS     o que memória e modelo dizem diferente (ou "nenhuma")
PRÓXIMO PASSO    o `next_step` registrado
```

Números vêm do inventário, não da lembrança do arquivo.

**Peça esclarecimento apenas quando uma divergência impedir avançar.** As outras
entram na lista e o trabalho segue.

---

# Encerrar

O objetivo é que a próxima sessão — ou outra pessoa — consiga retomar sem você.
Isso não se consegue guardando a conversa: se consegue guardando **o que ela
produziu**.

## 1. Confirmar o que virou fato

Liste, em conversa, o que esta sessão apurou, para o arquiteto confirmar antes de
virar arquivo. Evidência que ele não confirmou continua `evidence`.

## 2. Promover o que virou modelo

Informação que ele confirmou e que já existe no YAML **sai** do
`project-context.yaml` — deixar nos dois lugares cria duas verdades que divergem
na semana seguinte. Em `elementos_conhecidos`, preencha `representacao` com o id
que passou a existir.

## 3. Registrar decisões e dúvidas

- decisão que o arquiteto tomou e informou hoje → `$MEM/decisions/MD-NNN-*.md`,
  com as palavras dele. Decisão que deixou de valer vira `substituida`, apontando
  a que a sucedeu — **nunca reescreva a antiga como se sempre tivesse sido outra**;
- convenção que ele declarou → `$M/model/MODELING-CONVENTIONS.md`;
- dúvida aberta sem alvo no modelo → `questions`. Dúvida sobre uma caixa que
  existe pertence a uma **nota** `question` nela, e não à lista;
- dúvida respondida hoje sai da lista.

## 4. Atualizar o `session.yaml`

`focus`, `last_operation`, `next_step`, `pending`, `touched_files`, e o
`model_fingerprint` com as contagens de
`cfour check --modelagem <id> --inventory --json` — **desta** modelagem. Um
fingerprint tirado com `--all` garante uma divergência falsa na próxima retomada.

`next_step` precisa ser acionável: *"criar os containers do `identity` que o
arquiteto listou, e perguntar em que projeto o `auth-db` deve morar"* é próximo
passo; *"continuar a modelagem"* não é.

## 5. Gravar o resumo

`$MEM/sessions/AAAA-MM-DD-<assunto>.md`, no formato de
`${CLAUDE_PLUGIN_ROOT}/skills/modelagem/references/templates/session-summary.md`.

**Resumo estruturado, nunca transcrição.** Ninguém relê transcrição, e o que
importa fica enterrado nela.

## 6. Fechar

- `cfour check --modelagem <id>` sem erro novo;
- nada duplicado entre modelo e memória;
- `next_step` do `session.yaml` batendo com o próximo foco do resumo;
- tudo que foi escrito hoje está **na mesma modelagem** que você anunciou ao abrir.

Relate o que ficou pendente. Encerrar com pendência declarada é honesto; encerrar
dizendo que está tudo fechado quando não está é o único desfecho ruim.

## O que nunca fazer

- Retomar sem dizer qual modelagem, ou escolher por ela quando há mais de uma.
- Misturar memória de duas modelagens na mesma apresentação.
- Reconstruir o contexto "de memória" quando os arquivos existem.
- Corrigir divergência em silêncio.
- Repetir a contextualização que já foi feita — releia, não repita.
- Tratar bloco de versão anterior (`strategy`, `complexity`, `workflow`) como
  pauta do dia.
