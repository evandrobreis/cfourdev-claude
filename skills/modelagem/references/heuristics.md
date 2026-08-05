# Heurísticas — indexadas por sinal, nunca por tipo de projeto

Este arquivo não contém soluções. Contém **o que investigar quando você ouve
alguma coisa**.

Como usar: encontre o sinal no que o arquiteto disse, faça **duas ou três** das
perguntas — não a lista inteira — e registre o que voltar no lugar certo do
modelo. Uma iniciativa qualquer aciona vários sinais ao mesmo tempo; isso é
esperado e não define o "tipo" dela.

**Nenhuma heurística produz uma decisão.** Todas produzem perguntas, hipóteses,
alternativas e trade-offs. Se você se pegou concluindo "portanto, separe em três
serviços", parou de usar a heurística e começou a prescrever.

---

## Sinal 1 — a mesma unidade acumula responsabilidades diferentes

*Você ouve:* "esse serviço autentica, monta os dados e ainda orquestra o
fechamento".

Investigar: essas responsabilidades mudam no mesmo ritmo? têm o mesmo dono?
precisam escalar juntas? compartilham transação? uma tem exigência de segurança
que as outras não têm? se uma falhar, faz sentido as outras continuarem?

Trade-off: separar melhora autonomia e clareza de ownership, e cobra
coordenação, latência e um contrato novo para manter. Manter junto é mais simples
até o dia em que dois times precisam alterar a mesma caixa na mesma semana.

Onde vai parar: se a separação for **lógica**, componentes dentro do mesmo
container. Se for **operacional** (deploy e ciclo de vida próprios), containers
distintos. Enquanto não se sabe: uma nota `question` na caixa.

---

## Sinal 2 — dependência síncrona

*Você ouve:* "ele chama a API do outro e espera a resposta".

Investigar: o que acontece com o chamador quando o chamado está fora? existe
timeout definido? há retry — e a operação é idempotente? a falha se propaga para o
usuário ou é degradada? quem é avisado quando quebra? o contrato tem versão?

Trade-off: síncrono é simples de raciocinar e acopla disponibilidades — a
disponibilidade do chamador passa a ser o produto das duas.

Onde vai parar: `kind: sync` na relação; o comportamento em falha é matéria de
**caminho triste de fluxo**, não de mais um diagrama; risco de indisponibilidade
em nota `risk`.

---

## Sinal 3 — comunicação assíncrona

*Você ouve:* "publica um evento", "joga na fila".

Investigar: a semântica é "aconteceu" (evento) ou "faça" (comando)? entrega ao
menos uma vez — o consumidor aguenta duplicidade? a ordem importa? quanto tempo
fica retido? dá para reprocessar? quem é dono do contrato da mensagem, o produtor
ou o consumidor? quantos consumidores existem hoje, e quem descobre quando um
novo aparece?

Trade-off: assíncrono desacopla disponibilidade e acopla **contrato e tempo** —
o problema muda de lugar, não desaparece.

Onde vai parar: o tópico ou a fila é um **container** (roda separado);
`kind: event` ou `async` nas setas; ordenação e reprocessamento em `description`
ou nota.

---

## Sinal 4 — dados compartilhados

*Você ouve:* "os dois leem a mesma base", "a tabela é comum".

Investigar: quem é a **autoridade** do dado — quem pode mudá-lo? os outros leem
cópia ou o original? o que acontece se a autoridade mudar o esquema? há
concorrência de escrita? o dado tem exigência de retenção ou classificação de
sensibilidade? a leitura direta existe porque é certa ou porque foi mais rápida?

Trade-off: banco compartilhado economiza integração hoje e transforma esquema em
API pública amanhã — sem contrato, sem versão e sem quem responda por ela.

Onde vai parar: a base é container do dono; quem lê de fora ganha uma seta
explícita para ela; a dúvida de autoridade vira nota `question` na base;
`meta: { owner: … }` quando o dono estiver definido.

---

## Sinal 5 — fronteira incerta

*Você ouve:* "não sei se isso é um sistema separado ou parte daquele".

Investigar: quem decide o que entra na próxima release? o deploy é o mesmo? o
vocabulário é o mesmo — "pedido" quer dizer a mesma coisa dos dois lados? os dados
são os mesmos? se um time sumisse amanhã, o outro conseguiria evoluir aquilo?

Trace a fronteira onde estão a **decisão** e o **vocabulário**, não onde está o
repositório. Estrutura de repositório é consequência, não causa.

Onde vai parar: enquanto indeciso, **não invente hierarquia** — modele no nível
que se conhece e registre a dúvida como nota `question`, com as duas leituras
possíveis. A decisão, quando vier, vira `MD-NNN`.

---

## Sinal 6 — transformação temporal

*Você ouve:* "hoje é assim, mas vai virar aquilo".

Investigar: os dois estados coexistem, e por quanto tempo? o que decide que a
transição acabou? dá para voltar atrás? durante a coexistência, quem é a
autoridade do dado? quem sincroniza os dois lados? **e quem vai olhar essas
visões — a mesma pessoa, ou o alvo é para o comitê e o atual é para o time?**

Só crie perspectivas temporais separadas se elas **apoiarem decisões diferentes**.
Duas visões quase idênticas custam manutenção dobrada e divergem em uma semana.

Onde vai parar: se as visões se justificarem, diagramas distintos com `tags` ou
`meta` marcando o horizonte, e a diferença explicada em nota. Se não, uma visão só
com o que é estável e notas marcando o que muda.

---

## Sinal 7 — a mesma capacidade aparece em vários sistemas

*Você ouve:* "cada um tem o seu cálculo de preço".

Investigar: é a **mesma** capacidade ou capacidades parecidas com regras
diferentes? as diferenças são acidente histórico ou exigência real de cada
negócio? quem consumiria uma versão única? quem decide as regras quando ela for
uma só? o que acontece com quem não migrar?

Trade-off: unificar reduz duplicação e cria um ponto de coordenação — e de
disputa — entre times que antes decidiam sozinhos.

Onde vai parar: enquanto não se sabe se é uma ou várias, **modele como está** (uma
caixa por sistema) e registre a hipótese de unificação em `project-context.yaml`.
Desenhar a caixa unificada antes da decisão é desenhar a conclusão.

---

## Sinal 8 — ownership difuso

*Você ouve:* "não sei bem quem cuida disso hoje".

Investigar: quem é chamado quando quebra às 3h? quem aprova mudança? quem paga a
conta? é o mesmo time dos vizinhos? a resposta é "todo mundo" ou "ninguém"?

Onde vai parar: `meta: { owner: … }` quando houver resposta; nota `question` ou
`risk` quando não houver — dono indefinido é risco arquitetural, não lacuna de
cadastro. Não invente um dono para preencher o campo.

---

## Sinal 9 — o elemento que aparece em todas as visões

*Você ouve:* nada; você **vê**, ao montar o terceiro desenho com a mesma caixa no
meio.

Investigar: ela é infraestrutura (todo mundo usa, ninguém depende do
comportamento) ou é um acoplamento real? quantas caixas quebram se ela cair? ela
cresceu por acaso ou foi decidida assim? o que ela sabe que ninguém mais sabe?

Onde vai parar: nota `risk` de ponto único de falha; possivelmente `neighbors` em
vez de membro em algumas visões, para não dominar todos os desenhos.

---

## Sinal 10 — granularidade assimétrica

*Você ouve:* nada; você **vê** um sistema decomposto em 12 componentes ao lado de
outro que é uma caixa só.

Investigar: a diferença reflete conhecimento (sabemos mais de um) ou importância
(um decide mais)? a decisão em jogo depende do interior do que está fechado? quem
lê vai concluir que a caixa fechada é simples?

Detalhe é uma afirmação: dizer que algo é uma caixa só afirma que o interior não
importa **para aquela conversa**. Decompor porque dá para decompor é ruído.

Onde vai parar: se a assimetria for por desconhecimento, nota `question`. Se for
deliberada, uma linha em `MODELING-CONVENTIONS.md` explicando o critério — senão o
próximo leitor vai "corrigir".

---

## Sinal 11 — audiência mista

*Você ouve:* "isso é para o comitê, mas os devs também vão usar".

Investigar: as duas plateias tomam a mesma decisão? o que é ruído para uma é
essencial para a outra? existe alguém que precise dos dois níveis ao mesmo tempo,
ou são momentos diferentes?

Trade-off: uma visão para dois públicos costuma servir mal aos dois. Duas visões
sobre o mesmo modelo custam quase nada — o modelo é um só, o que muda é o recorte.

Onde vai parar: duas visões com `include`/`where` diferentes, cada uma com sua
`question` e sua `audience` registradas.

---

## Sinal 12 — vocabulário divergente

*Você ouve:* "o que eles chamam de pedido a gente chama de solicitação".

Investigar: são o mesmo conceito com dois nomes, ou dois conceitos parecidos? a
diferença de nome acompanha uma diferença de fronteira? qual nome o **leitor** da
visão usa?

Onde vai parar: o glossário em `project-context.yaml`, sempre. O `name` da caixa
usa o vocabulário da audiência da visão; o `id` usa o vocabulário estável. Termos
equivalentes são exatamente o que `/cfour:reconciliar` procura.

---

## Sinal 13 — passo de fluxo marcado com `!`

*Você ouve:* nada; **`cfour check`** avisa.

Significa: o passo usa uma ligação que o modelo não declara, e não é nenhuma das
três exceções legítimas (resposta, chamada interna, entrega para dentro de si).

Investigar, nesta ordem: a integração existe na realidade e falta no modelo — ou a
história está contando algo que não acontece? se falta, quem é a origem no nível
mais fino que se conhece? se a história é que está errada, quem contou e por quê?

Onde vai parar: uma relação nova no modelo, **ou** a correção do passo. Nunca
apague o aviso "arrumando o desenho": ele é o modelo apontando o próprio buraco.
