# Rótulo não é estratégia

Um rótulo descreve o vocabulário de quem fala. Ele **não** informa fronteira,
granularidade, audiência nem decisão — que é o que determina como modelar.

> Duas iniciativas chamadas "plataforma" podem exigir estratégias opostas.
> Duas chamadas "migração" e "produto novo" podem exigir a mesma.

Quando um rótulo aparecer, faça o seguinte, nesta ordem:

1. **Devolva o termo para quem o usou.** "Quando você diz plataforma, o que ela
   precisa fazer que hoje não é feito?"
2. **Registre o que ele significa aqui**, no glossário de `project-context.yaml`.
3. **Trate qualquer padrão que você reconheceu como HIPÓTESE**, com o que a
   refutaria — nunca como classificação.

Forma correta de trazer um padrão à conversa:

> Pelo que você descreveu, há características de transformação progressiva de um
> ecossistema existente. Isso *pode* pedir perspectivas separadas para hoje, para a
> transição e para o alvo. Antes de propor essas visões, preciso entender se as três
> vão apoiar decisões diferentes — se for a mesma conversa, uma visão só serve
> melhor.

Forma incorreta:

> Este é um strangler, então crie os diagramas atual, alvo e transição.

---

## As perguntas que cada rótulo esconde

Nenhuma linha abaixo autoriza uma estrutura. Todas produzem perguntas.

| quando ouvir | descubra antes de qualquer coisa |
|---|---|
| **plataforma** | que problema ela resolve que hoje não é resolvido? quem são os consumidores, e eles podem dizer não? quem decide o roadmap dela? ela tem dono operacional? |
| **componente / componentização** | o que "componente" quer dizer aqui — módulo no código, unidade com deploy próprio, capacidade de negócio? tem dono? tem consumidor fora de quem o criou? |
| **legado** | legado por idade, por tecnologia, por falta de dono, ou por estar em fim de vida? ele ainda decide alguma coisa? quem depende dele hoje? |
| **modernização** | modernizar o quê, medido como? qual dor concreta motivou? o que acontece se nada mudar? |
| **strangler / estrangulamento** | os dois lados coexistem por quanto tempo? o que decide que acabou? dá para voltar? quem é a autoridade do dado durante a coexistência? |
| **migração** | migra o quê — dado, tráfego, time, contrato? big bang ou onda? quem fica para trás e por quanto tempo? |
| **microsserviço** | separado por quê — escala, time, ciclo de vida, isolamento de falha? quem opera cada um? qual transação atravessa mais de um? |
| **monólito** | é um problema hoje, ou só um formato? o que dentro dele muda em ritmo diferente do resto? a dor é de deploy, de time ou de acoplamento? |
| **eventos / event-driven** | evento é "aconteceu" ou comando disfarçado? quem é dono do contrato? quantos consumidores existem, e quem sabe quando surge um novo? |
| **SaaS / multi-tenant** | isolamento onde — dado, processo, deploy? o tenant aparece na arquitetura ou só nos dados? há tenant que exige exceção? |
| **integração** | integração entre quem, e quem é dono do contrato? síncrona por necessidade ou por hábito? o que acontece quando o outro lado muda? |
| **jornada** | ela atravessa quantos sistemas e quantos times? o interesse é a sequência (fluxo) ou o mapa de quem participa (diagrama)? onde ela costuma falhar? |
| **domínio** | domínio no sentido de negócio, de time ou de módulo? quem define a fronteira? o mesmo termo significa o mesmo dos dois lados? |
| **plataforma de dados / data lake** | quem é a autoridade de cada dado? quem consome, com que latência? é cópia ou original? quem responde pela qualidade? |
| **API / API-first** | quem publica, quem consome, quem versiona? é contrato ou é o esquema do banco exposto? |
| **hub / barramento / roteador** | ele decide alguma coisa ou só transporta? o que quebra quando ele cai? por que a comunicação não é direta? |

Se o rótulo que apareceu não estiver nesta tabela, o procedimento é o mesmo:
peça a definição local, registre no glossário e siga investigando pelos sinais em
`heuristics.md`.
