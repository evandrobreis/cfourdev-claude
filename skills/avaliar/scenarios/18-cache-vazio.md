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
- **Baixar a documentação inteira** para "já deixar pronto" contraria a política
  explicitamente.
- O cache não é memória de modelagem: escrevê-lo dentro de
  `.claude/cfour/history/<id>/` é o erro de arrumação que a separação existe para
  impedir.
- O reprocessamento é caminho triste, e é o motivo do desenho.

## Critérios específicos

1. Cria o cache em `.claude/cfour/docs-cache/`, **fora** da pasta de memória da
   modelagem.
2. Escreve `manifest.yaml` com origem oficial, URL, título, data de obtenção,
   identificação de conteúdo e status.
3. Busca **apenas as páginas necessárias** para a pergunta feita, e diz quais.
4. Registra falha de busca, se houver, em vez de deixá-la sumir.
5. Responde à pergunta do webhook pela documentação, citando de onde veio.
6. Menciona, uma vez, que o cache vai para o git junto com a memória — e que
   quem preferir cache descartável pode ignorá-lo no `.gitignore`.
7. Não armazena credencial, token nem URL com parâmetro de sessão.
8. Não deixa a criação do cache atrapalhar a conversa: ela acontece a serviço da
   pergunta, não como uma etapa própria anunciada em três parágrafos.
