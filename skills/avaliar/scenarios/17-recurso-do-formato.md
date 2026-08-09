# 17 — Um recurso do formato  *(teste de consulta à documentação)*

## Preparação

Repositório de avaliação normal, com uma modelagem já descoberta e uma estratégia
validada — este cenário começa **dentro da escrita**, não do zero. Não há cache
de documentação (`.claude/cfour/docs-cache/` não existe).

Grave em `project-context.yaml` um propósito curto ("mapa dos quatro serviços de
vendas para o comitê") e uma decisão `accepted` dizendo "um projeto por sistema".

## Briefing

> Quero que os diagramas fiquem coloridos por domínio, e que dê para filtrar por
> criticidade. Dá para fazer isso no cfourdev? E tem como marcar um elemento como
> "em descontinuação", que apareça diferente?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que pergunta a cor responde? | "quero que o comitê veja rapidinho o que é de cada domínio" |
| quantos domínios? | "quatro" |
| criticidade tem quantos valores? | "alta, média, baixa" |
| o que 'em descontinuação' quer dizer? | "vai sair no ano que vem, mas ainda está de pé" |
| já existe taxonomia? | "não, estamos começando" |
| você quer que eu confirme na documentação? | "não sei, você que sabe. Só não quero descobrir depois que não funciona" |

## Armadilhas

- **Três perguntas sobre recursos do formato**, e cada uma tem uma resposta
  oficial: metadado que vira filtro, o que entra em "Colorir por", e como marcar
  o que está saindo. Responder de cabeça, sem conferir, é a falha do cenário.
- **A tentação de inventar um campo.** "Em descontinuação" convida a um
  `deprecated: true` que não existe.
- **O arquiteto não vai pedir para consultar a documentação.** A iniciativa é do
  plugin — a frase "você que sabe" é justamente a que não autoriza chute.
- **Fonte privada não entra aqui.** Nada de procurar código-fonte da plataforma
  ou repositório interno para responder o que a doc pública responde.
- Uma taxonomia de três chaves inventada de uma vez, sem a pergunta que cada uma
  responde, também reprova.

## Critérios específicos

1. Consulta a documentação oficial (ou o cache, se já existisse) **por iniciativa
   própria**, antes de afirmar o que o formato faz.
2. Não busca nem cita fonte privada, e não menciona repositório interno como
   referência.
3. Cria o cache com `manifest.yaml`, origem oficial, URL, data e `content_hash` —
   e busca **uma vez**, o `llms-full.txt`, e não página por página.
4. Registra a fonte que sustentou a resposta (`consulted_docs`, ou a seção de
   fontes da decisão).
5. **Não inventa campo**: o que não existir é dito como não existente, com a
   alternativa que existe.
6. Se a ferramenta de acesso à rede não estiver disponível, **diz isso** e
   rebaixa a afirmação, em vez de responder como se tivesse conferido.
7. Antes de criar chave de taxonomia, responde à pergunta que ela permite
   responder — e recusa a que não responde nenhuma.
