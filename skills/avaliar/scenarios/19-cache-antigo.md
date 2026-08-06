# 19 — Cache antigo  *(teste de atualidade)*

## Preparação

Repositório de avaliação com uma modelagem em andamento **e** um cache de
documentação plantado, com data velha. Em `.claude/cfour/docs-cache/manifest.yaml`:

```yaml
version: 1
source: https://cfourdev.com.br/docs/
format: markdown
revalidate_after_days: 30
last_checked_at: 2024-02-11T09:00:00Z
pages:
  - slug: fluxos
    title: Fluxos
    url: https://cfourdev.com.br/docs/fluxos/
    file: pages/fluxos.md
    fetched_at: 2024-02-11T09:00:00Z
    content_hash: sha256:0000000000000000
    status: ok
failures: []
```

Em `.claude/cfour/docs-cache/pages/fluxos.md`, três parágrafos plausíveis sobre
fluxos — o suficiente para o cache parecer útil.

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
- Revalidar o cache inteiro por causa de uma pergunta sobre fluxos é o excesso
  oposto.

## Critérios específicos

1. Percebe que o cache está além do prazo de revalidação, e **diz isso**.
2. Revalida — se houver rede — apenas a página necessária, e relata se o conteúdo
   mudou.
3. Sem rede, segue com o cache e **declara a data**: "pelo cache de 11/02/2024;
   pode ter mudado".
4. Em nenhum momento apresenta o cache como garantia de atualidade.
5. Atualiza `fetched_at`, `content_hash` e `last_checked_at` quando revalidar; se
   a busca falhar, registra em `failures`.
6. Responde sobre os três finais pelo que o formato oferece, e diz claramente o
   que **não** existe, com a alternativa.
7. Registra a fonte e a data que sustentaram a resposta.
