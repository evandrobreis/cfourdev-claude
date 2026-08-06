# 12 — Aplicação simples  *(teste de proporcionalidade)*

## Briefing

> Preciso documentar a arquitetura do nosso portal de RH. É um front em React,
> uma API em Node e um Postgres. Somos quatro pessoas. Consegue montar?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "vai entrar gente nova no time no mês que vem, quero que entendam rápido" |
| quem lê? | "os devs que entrarem, e eu" |
| deploy? | "tudo junto, num container só por serviço. Front na Vercel, API e banco na AWS" |
| integrações? | "manda e-mail pelo SendGrid e puxa dados do sistema de folha uma vez por dia" |
| banco, fila, cache? | "só o Postgres. Não tem fila. Cache nenhum" |
| a puxada da folha é como? | "um job à meia-noite que lê um CSV do SFTP deles" |
| tem caso de uso crítico? | "não muito. Se a folha falhar, a gente roda de novo de manhã" |
| segurança, regulação? | "tem dado pessoal, mas nada além do óbvio. LGPD normal" |
| multi-tenant, ambientes? | "não. Tem homologação e produção, iguais" |

## Armadilhas

- **O peso do processo é o que está sob teste.** Todas as respostas cabem em
  duas rodadas; um plugin que faz seis rodadas, propõe quatro projetos e promete
  cinco diagramas falha aqui mesmo acertando o conteúdo.
- **"Documentar a arquitetura" não é resposta**, e a insistência única tem de
  chegar em onboarding — que é resposta legítima e muda a granularidade.
- **O job da folha é fácil de perder.** Ele é a única coisa assíncrona da
  arquitetura, e o arquiteto só o menciona se perguntado sobre background.
- Um `id` derivável existe desde a primeira frase (`portal-rh`, `rh`).

## Critérios específicos

1. Classifica como perfil **leve**, com justificativa ligada às características
   (uma aplicação, um time, uma integração diária) — e registra.
2. Chega à estratégia em **no máximo duas rodadas** de perguntas.
3. A cobertura técnica sai de **uma pergunta agrupada**, não de sete.
4. Descobre o job da folha sem que o arquiteto o ofereça espontaneamente.
5. Propõe o slug já derivado, sem pedir que o arquiteto invente um.
6. A estratégia cabe num parágrafo: um projeto, convenção de id, duas ou três
   visões — e diz explicitamente o que **não** vale desenhar.
7. Entra na escrita anunciando a transição, e escreve a onda 1 na mesma sessão.
8. Não promete perspectivas temporais, taxonomia elaborada nem ondas que este
   caso não tem.

## Comparação obrigatória

Junto com **01**: os dois são pequenos e devem receber perfis iguais, apesar de
o 01 se chamar "plataforma" e este não se chamar nada. E junto com **13**, que é
o oposto em tamanho: o contraste entre os dois processos é o que se mede.
