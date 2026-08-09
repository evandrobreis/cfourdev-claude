# 18 — Cache vazio  *(teste de criação do cache)*

## Preparação

Repositório de avaliação normal. **Não existe `.claude/cfour/` nenhum** — nem
memória, nem cache. É a primeira vez que alguém modela aqui.

## Briefing

> Primeira vez usando isso. Quero modelar nosso gateway de integração: recebe
> webhook de quatro parceiros, normaliza e publica num tópico. Antes de começar:
> como eu represento um webhook que chega de fora? É uma seta para dentro?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "queremos saber se vale ter um adaptador por parceiro ou um só configurável" |
| quem lê? | "os dois times que mantêm isso" |
| os parceiros são iguais? | "não. Dois mandam JSON, um manda XML e um manda arquivo por SFTP" |
| o que acontece quando falha? | "a gente reprocessa da fila de erro. Isso é importante aparecer" |
| tem banco? | "um Postgres para idempotência, e um Redis para deduplicar" |
| quem é dono do contrato? | "o parceiro. A gente se adapta" |

## Armadilhas

- **A pergunta do webhook é sobre o formato**, e a resposta certa está na
  documentação: como se representa um sistema externo que chama você, e o que é
  caixa `external`.
- **Criar o cache é parte do trabalho**, e criar errado — sem manifesto, sem
  origem, sem data — passa despercebido até alguém precisar saber de onde aquilo
  veio.
- **Buscar as páginas de `/docs/<slug>/` uma a uma** é o modo antigo, e agora é
  erro: a fonte é um arquivo só, e o endereço por seção existe para citar a uma
  pessoa.
- O cache não é memória de modelagem: escrevê-lo dentro de
  `.claude/cfour/history/<id>/` é o erro de arrumação que a separação existe para
  impedir.
- O reprocessamento é caminho triste, e é o motivo do desenho.

## Critérios específicos

1. Cria o cache em `.claude/cfour/docs-cache/`, **fora** da pasta de memória da
   modelagem.
2. Escreve `manifest.yaml` com origem oficial, URL, data de obtenção,
   `content_hash` e status.
3. Busca **uma vez**, em `https://cfourdev.com.br/llms-full.txt`, e guarda o
   arquivo como veio — não recorta, não resume, não busca página por página.
   Buscar o `/llms.txt` para descobrir o endereço também é requisição a mais.
4. Registra falha de busca, se houver, em vez de deixá-la sumir.
5. Responde à pergunta do webhook pela documentação, citando de onde veio.
6. Menciona, uma vez, que o cache vai para o git junto com a memória — e que
   quem preferir cache descartável pode ignorá-lo no `.gitignore`.
7. Não armazena credencial, token nem URL com parâmetro de sessão.
8. Não deixa a criação do cache atrapalhar a conversa: ela acontece a serviço da
   pergunta, não como uma etapa própria anunciada em três parágrafos.
