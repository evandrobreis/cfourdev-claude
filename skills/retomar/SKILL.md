---
name: retomar
description: Retoma um trabalho de modelagem arquitetural no cfourdev — lista as modelagens registradas, carrega a memória da que o arquiteto escolher, monta o inventário do modelo, compara com decisões e convenções, aponta divergências e propõe o próximo passo. Use ao voltar a uma modelagem começada em outra sessão, ao abrir o repositório sem saber em qual realidade o trabalho parou, ou quando pedirem /cfour:retomar.
---

# Retomar a modelagem

Uma sessão nova não tem o histórico da anterior. Ela tem os arquivos — e eles
bastam, se forem lidos na ordem certa.

## Procedimento

### 0. Qual modelagem

Um arquiteto mantém N realidades. Retomar a errada é pior que não retomar nada:
você chega com contexto que parece certo e não é.

Leia `cfour.yaml` e conte:

- **Nenhuma** → não há memória de modelagem aqui. Ofereça `cfour:modelagens` para
  criar a primeira, ou `cfour:descoberta` se o assunto já estiver na mesa.
- **Uma** → é ela. Anuncie e siga.
- **Mais de uma** → **liste todas e pergunte**, mesmo havendo uma `active`. O
  `active` diz onde o trabalho estava, não onde ele vai continuar hoje.

Para cada uma, mostre uma linha vinda de `$MEM/session.yaml`:

```
MODELAGENS
  ● <id>   <name>
      parou em: <focus, uma linha>
      próximo:  <next_step, uma linha>
    <id>   <name>
      ...
```

Só depois da escolha, siga. Todo o resto deste procedimento vale para **uma**
modelagem, e `$M` é a dela.

### 1. Carregar as fontes, na ordem de precedência

1. `$M/model/MODELING-CONVENTIONS.md` (se existir)
2. `$MEM/decisions/*.md` — só as `accepted`; as `superseded` interessam
   como história, não como regra
3. `$MEM/project-context.yaml`
4. `$MEM/session.yaml`
5. o resumo mais recente em `$MEM/sessions/`

Se **nada disso existir**, não invente estado: diga que esta modelagem está
registrada mas não tem memória, e ofereça `cfour:descoberta` nela.

### 2. Inventariar o modelo

```bash
cfour check --modelagem <id> --inventory --json
```

É a verdade sobre o que existe agora — projetos, caixas, setas, visões, fluxos,
notas, conteúdo inalcançável, passos `!` e as contagens.

### 3. Comparar

Confronte o inventário com o que a memória diz. Procure:

- **contagens diferentes de `model_fingerprint`** → alguém editou fora do harness;
- caixas, visões ou fluxos que nenhuma decisão previa;
- convenção declarada e não seguida (id fora do padrão, `meta` que ninguém usa,
  taxonomia que cresceu sem decisão);
- hipótese `open` que o modelo já resolveu — ou contradiz;
- pergunta `open` cuja resposta já está no YAML;
- `pending_confirmations` que viraram arquivo sem terem sido confirmadas;
- referências mortas: decisão ou resumo citando id que não existe mais.

### 4. Apresentar

Curto, nesta forma:

```
MODELAGEM        <id> — <name>
ONDE ESTÁ        propósito em uma linha · o que já está modelado (números)
ÚLTIMA SESSÃO    data · o que foi feito
EM ABERTO        decisões proposed · hipóteses open · perguntas open
DIVERGÊNCIAS     o que a memória e o modelo dizem diferente (ou "nenhuma")
PRÓXIMO PASSO    o `next_step` registrado, e por que ele era o próximo
```

Números vêm do inventário, não da lembrança do arquivo.

### 5. Perguntar só o necessário

**Peça esclarecimento apenas quando uma divergência impedir avançar.** Divergência
que não bloqueia entra na lista e o trabalho segue — parar tudo por uma
inconsistência de `meta` é desperdiçar a sessão.

Se houver muitas divergências, ou se elas parecerem sistemáticas, ofereça
`/cfour:reconciliar` em vez de tratá-las uma a uma aqui.

## Depois de retomar

Atualize `$MEM/session.yaml` com o `focus` da nova sessão e siga para a
skill que o próximo passo pede — normalmente `cfour:entrevista`.

Se a modelagem retomada não for a `active` do registry, pergunte se o `active`
deve mudar. Trocar por conta própria reescreve uma afirmação que vai para o git.

## O que nunca fazer

- Retomar sem dizer qual modelagem, ou escolher por ela quando há mais de uma.
- Misturar memória de duas modelagens na mesma apresentação. Elas não se
  comparam: divergência entre elas não é divergência, é assunto diferente.
- Reconstruir o contexto "de memória" quando os arquivos existem.
- Tratar o `session.yaml` como mais autoritativo que o modelo: ele é o nível 6 da
  precedência, o YAML é o 2.
- Corrigir divergência em silêncio. Mostrar antes de mexer é o ponto inteiro.
- Recomeçar a descoberta quando ela já foi feita — releia, não repita.
