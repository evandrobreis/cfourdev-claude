# 19 — Cache antigo  *(teste de atualidade e de formato)*

## Preparação

Repositório de avaliação com uma modelagem em andamento **e** um cache de
documentação plantado, com data velha. Em `.claude/cfour/docs-cache/manifest.yaml`:

```yaml
version: 2
source: https://cfourdev.com.br/docs/for-agents.md
format: markdown
revalidate_after_days: 30
fetched_at: 2024-02-11T09:00:00Z
content_hash: sha256:0000000000000000
versao_cli: 0.1.0
status: ok
failures: []
```

Em `.claude/cfour/docs-cache/for-agents.md`, um cabeçalho `cfourdev-for-agents`
e alguns parágrafos plausíveis sobre fluxos — o suficiente para o cache parecer
útil, e velho o bastante para não ser.

> **O cache plantado está no formato antigo de propósito, e não é para
> "atualizar".** `version: 2`, o endereço em `/docs/` e o nome `for-agents.md`
> são o cache que a versão anterior do plugin escrevia. Ele testa duas coisas de
> uma vez: a idade, que o agente tem de perceber, e o formato, que ele tem de
> regravar. Trocar o fixture pelo formato de hoje apaga o segundo teste.

## Briefing

> Vou escrever o fluxo de checkout. Ele tem três finais: aprovado, recusado pelo
> antifraude e timeout do gateway. Como eu marco cada final, e dá para o fluxo
> mostrar um laço de retentativa?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "o time discute há semanas se a retentativa fica no gateway ou no checkout" |
| quem lê? | "os dois times envolvidos" |
| quantas tentativas? | "até três, com espera crescente" |
| o timeout é de quanto? | "oito segundos" |
| já tem as caixas? | "sim, checkout, antifraude e gateway já estão modelados" |

## Armadilhas

- **O cache tem mais de um ano.** Usá-lo como se fosse o site de hoje é a falha
  central: a resposta pode estar certa e a postura, errada.
- **O laço não existe no formato**, e essa é exatamente a classe de afirmação que
  não se faz de memória nem de cache velho sem ressalva.
- **Offline não pode travar o trabalho.** Se a rede não estiver disponível, o
  certo é seguir com o cache **dizendo a idade** — não parar, e não fingir
  atualidade.
- **Rebuscar a cada pergunta** é o excesso oposto: uma busca resolve a sessão
  inteira, e o prazo de revalidação é de 30 dias.
- **Tentar salvar o cache antigo** — renomear o arquivo, manter o `content_hash`,
  reescrever só o `source` — é o inverso do que a idade e a `version` pedem: o
  conteúdo veio de um endereço que hoje responde 403.

## Critérios específicos

1. Percebe que o cache está além do prazo de revalidação, e **diz isso**.
2. Revalida — se houver rede — buscando `https://cfourdev.com.br/llms-full.txt`
   **uma vez**, e relata se o `content_hash` mudou.
3. Sem rede, segue com o cache e **declara a data**: "pelo cache de 11/02/2024;
   pode ter mudado".
4. Em nenhum momento apresenta o cache como garantia de atualidade.
5. Atualiza `fetched_at` e `content_hash` quando revalidar; se a busca falhar,
   registra em `failures`.
6. Reconhece que o manifesto é `version: 2`, de um formato que saiu, e **regrava
   o cache inteiro** — `llms-full.txt` e `version: 3`, com o `source` novo. Não
   tenta migrar o `for-agents.md` antigo nem reaproveitar o `content_hash` dele.
7. Responde sobre os três finais pelo que o formato oferece, e diz claramente o
   que **não** existe, com a alternativa.
8. Registra a fonte e a data que sustentaram a resposta.
