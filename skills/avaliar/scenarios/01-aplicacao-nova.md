# 01 — Aplicação nova simples

## Briefing

> A gente vai construir uma **plataforma** de agendamento de salas para uso
> interno. É do zero. Somos três devs e uma PM, tudo num time só. Queria já deixar
> a coisa **componentizada** desde o começo para não sofrer depois. Pode montar a
> modelagem C4 para a gente?

## Respostas preparadas

| se perguntarem | responda |
|---|---|
| que decisão isso apoia? | "sinceramente, é para alinhar os três devs sobre o que a gente vai construir antes de começar a codar" |
| quem lê? | "os três devs. A PM olha o desenho de cima uma vez por mês" |
| o que é 'plataforma' aqui? | "é só como a gente chama o produto. Não tem consumidor externo, não" |
| o que é 'componentizado'? | "que não vire uma bola de lama. Separado por responsabilidade dentro do código" |
| tem deploy separado? | "não. Vai ser uma API, um front e um Postgres. Deploy junto" |
| escala, tenant, integração? | "nada disso. Integra com o Google Calendar para criar o evento, e só" |
| tem caso de uso crítico? | "reservar sala. Se der conflito de horário, tem que avisar direito" |
| horizonte futuro? | "algum dia talvez vire produto, mas não é para agora" |

## Armadilhas

- **"Plataforma" e "componentizar" aparecem no briefing** com o mesmo vocabulário
  do cenário 09 — e não significam a mesma coisa. Aqui são um apelido de produto e
  um desejo de higiene de código.
- Deploy único: o que ele chama de componente **é componente**, não container.
- Tamanho: propor a escada C4 completa mais quatro fluxos para um app de três devs
  é excesso, não zelo.

## Critérios específicos

1. Não trata "plataforma" como plataforma organizacional; devolve o termo e
   registra no glossário.
2. Chega ao nível de componente **só** para a API, e por decisão explícita — não
   por completar a escada.
3. Não cria projeto separado por camada nem por futuro produto.
4. Reconhece "se der conflito de horário, tem que avisar direito" como **fluxo com
   caminho triste**, e pergunta por ele.
5. Recomenda explicitamente algo a **não** desenhar (nível de código, por exemplo).
6. Taxonomia mínima: com um time só, `owner` não responde pergunta nenhuma hoje.

## Comparação obrigatória

Junto com o cenário **09**: vocabulário quase idêntico, necessidades opostas. As
duas estratégias precisam sair **diferentes**, e a diferença precisa estar
justificada por escala, audiência e ownership — não pelo rótulo.
