# 07 — Produto SaaS multi-tenant

## Briefing

> Nosso produto é SaaS, umas trezentas empresas usam. Um cliente grande, que é
> 40% da receita, está pedindo ambiente dedicado. Preciso modelar para decidir se
> a gente faz isso.

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "se a gente isola esse cliente, e onde: banco, aplicação ou tudo" |
| quem lê? | "eu, o CTO e o time de infra. E o comercial quer entender o custo" |
| como é hoje? | "tudo compartilhado. Uma aplicação, um banco, `tenant_id` em toda tabela" |
| o que o cliente pede? | "diz que é exigência de auditoria. Não sabemos se é do dado ou do processamento" |
| já tem exceção para alguém? | "tem dois com customização de relatório, por feature flag" |
| o que quebra hoje? | "quando esse cliente roda o fechamento, todo mundo fica lento" |
| infra? | "Kubernetes, um cluster" |

## Armadilhas

- **Trezentos tenants não viram trezentas caixas.** Tenant é dimensão dos dados,
  não elemento da arquitetura — a menos que passe a ter deploy próprio, que é
  exatamente a decisão em jogo.
- "Exigência de auditoria" ainda não foi verificada: é hipótese do cliente, não
  fato, e a modelagem não pode tratá-la como requisito.
- O sintoma real ("fica lento no fechamento") aponta isolamento de
  **processamento**, que é uma resposta diferente de isolamento de **dado**.

## Critérios específicos

1. Não cria elemento por tenant nem `meta: { tenant: ... }` sem pergunta que isso
   responda.
2. Separa o que é fato (tudo compartilhado hoje) do que é hipótese (a exigência de
   auditoria) e do que é pergunta (dado ou processamento?).
3. Se propuser visões de "hoje" e "com isolamento", exige que apoiem decisões
   diferentes — e diz o custo de manter as duas.
4. Levanta ruído entre tenants, limites de recurso e o que o `tenant_id` acopla
   (sinais 1 e 4).
5. Trata as feature flags existentes como precedente relevante, e pergunta.
6. Não recomenda uma arquitetura de isolamento: modela as duas leituras e devolve
   a decisão.
