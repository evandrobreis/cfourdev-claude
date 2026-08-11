# O que esclarecer — indexado por sinal

Este arquivo **não contém soluções, e não contém destinos**. Ele contém o que
perguntar quando você ouve alguma coisa e não sabe o que ainda falta saber.

Como usar: ache o sinal no que o arquiteto disse, faça **duas ou três** das
perguntas — nunca a lista inteira — e registre o que voltar como fato dele.

> **Nenhuma pergunta daqui produz uma decisão.** Se você se pegou concluindo
> "portanto é um container", "portanto vira um projeto separado" ou "portanto
> precisa de um diagrama de componentes", parou de esclarecer e começou a
> decidir. Onde cada coisa vai parar no modelo é resposta do arquiteto.

---

## Sinais que aparecem na conversa

**Uma unidade acumula responsabilidades diferentes** — *"esse serviço autentica,
monta os dados e ainda orquestra o fechamento"*: elas rodam no mesmo processo?
têm o mesmo dono? são implantadas juntas? você quer que apareçam como uma caixa
só ou como caixas distintas?

**Dependência síncrona** — *"ele chama a API do outro e espera a resposta"*: qual
o protocolo? o que acontece com o chamador quando o chamado está fora? isso
precisa aparecer no desenho, ou basta a seta?

**Comunicação assíncrona** — *"publica um evento"*, *"joga na fila"*: qual é a
tecnologia — fila, tópico, stream? ela tem nome próprio? o intermediário precisa
aparecer como caixa, ou a seta entre produtor e consumidor basta para o que você
quer explicar?

**Dados compartilhados** — *"os dois leem a mesma base"*: qual é a base, e onde
ela mora? quem escreve nela? os dois acessos precisam aparecer?

**Fronteira incerta** — *"não sei se isso é um sistema separado ou parte
daquele"*: essa fronteira já está decidida em algum lugar? enquanto não estiver,
em que nível você quer que eu registre o que já é certo?

**Transformação temporal** — *"hoje é assim, mas vai virar aquilo"*: qual estado
você quer documentar agora — o atual, o de transição, o alvo? mais de um? eles
convivem no mesmo desenho ou em desenhos diferentes?

**A mesma capacidade em vários sistemas** — *"cada um tem o seu cálculo de
preço"*: são implementações distintas hoje? você quer registrar uma caixa por
sistema, como está?

**Ownership difuso** — *"não sei bem quem cuida disso hoje"*: isso precisa
aparecer no modelo? existe um campo que vocês já usam para dono?

**Vocabulário divergente** — *"o que eles chamam de pedido a gente chama de
solicitação"*: qual dos dois nomes o leitor do desenho usa? os dois termos são a
mesma coisa, ou coisas diferentes?

**Uma sequência narrada** — *"aí o serviço chama, e quando o pagamento volta…"*:
isso é um caso de uso em ordem? você quer registrá-lo como fluxo? e o que
acontece quando dá errado — quais desfechos você quer contar?

**Passo de fluxo marcado com `!`** — o `cfour check` avisa: o passo usa uma
ligação que o modelo não declara. A integração existe e falta no modelo, ou a
sequência está contando algo que não acontece? A resposta é dele; a correção,
sua, depois da resposta.

---

## Rótulos: peça a definição local

Um rótulo descreve o vocabulário de quem fala. Ele não informa fronteira,
granularidade, audiência nem estrutura. Quando um aparecer, devolva o termo:
*"quando você diz plataforma, o que ela é aqui dentro?"*, e registre a resposta no
glossário.

| quando ouvir | pergunte |
|---|---|
| **plataforma** | o que ela é aqui: um sistema, um conjunto de sistemas, um time? quem a consome? |
| **componente / componentização** | componente quer dizer o quê aqui — módulo no código, unidade com deploy próprio, capacidade de negócio? |
| **legado** | qual sistema, concretamente? ele ainda está no ar? quem depende dele? |
| **modernização / migração** | migra o quê — dado, tráfego, aplicação, contrato? os dois estados precisam aparecer? |
| **microsserviço** | quantos existem, e quais? cada um tem implantação própria? |
| **monólito** | é uma aplicação só? você quer abri-la por dentro no desenho? |
| **eventos / event-driven** | qual é o intermediário — Kafka, RabbitMQ, SNS? ele precisa aparecer? |
| **multi-tenant** | o tenant aparece na arquitetura, ou só nos dados? |
| **integração** | entre quem e quem, por qual protocolo? |
| **jornada** | ela atravessa quais sistemas? o interesse é a sequência ou o mapa? |
| **domínio** | quais são eles, com os nomes que vocês usam? |
| **hub / barramento** | é uma aplicação que roda, ou uma forma de falar da integração? |
| **API-first / plataforma de dados** | quais aplicações concretas existem por trás disso? |

Se o rótulo não estiver na tabela, o procedimento é o mesmo: peça a definição
local, registre no glossário, e siga pelos sinais acima.

---

## As sete áreas — o que não pode ficar de fora em silêncio

Os sinais acima são **reativos**: respondem ao que o arquiteto disse. Não
alcançam o que ele não disse porque para ele é óbvio, e é assim que a fila que
sustenta metade do sistema fica fora do desenho.

Percorra as sete, **na medida do que está sendo documentado**, e sempre depois de
ler o que o repositório já responde:

| área | o que existe por aqui |
|---|---|
| `estrutura-funcional` | capacidades · domínios · jornadas · atores · responsabilidades · limites organizacionais |
| `aplicacoes` | web · mobile · BFF · APIs · workers · schedulers · funções · monólitos · serviços · legados · produtos de terceiro |
| `dados` | relacional · NoSQL · cache · storage de objetos · busca · lake · warehouse · replicação |
| `integracoes` | REST · GraphQL · gRPC · mensageria · streaming · filas · tópicos · webhooks · arquivos · batch · terceiros |
| `infraestrutura` | cloud · on-premises · regiões · clusters · gateways · service mesh · CDN · ambientes |
| `seguranca` | IdP · autenticação · autorização · fronteiras de confiança · segredos · dados sensíveis · exigências regulatórias |
| `operacao` | observabilidade · auditoria · disponibilidade · processamento assíncrono · jobs · dependências críticas |

Com pouca coisa em jogo, **uma pergunta agrupada fecha quase tudo**:

> Além da aplicação principal, existe banco, fila, cache, serviço externo ou algo
> rodando em background que precise aparecer?

**Em nenhum caso se lê a lista em voz alta**, e nunca se pergunta por área que não
muda o que vai ser escrito. Área verificada que não se aplica **se registra, com o
porquê** — silenciosamente desconhecida é o único desfecho ruim.

E o aviso que vale para as sete: **descobrir que algo existe não autoriza decidir
como representá-lo.** A resposta *"temos Kafka"* preenche a área de integrações e
não cria caixa nenhuma.

---

## Leia antes de perguntar

A maior parte destas respostas está no repositório. Perguntar o que o arquivo já
responde queima a paciência de quem já respondeu:

`README` · documentação técnica · ADRs · diagramas anteriores · código-fonte ·
`docker-compose.yml` · manifests de Kubernetes · Terraform · `package.json`,
`pom.xml` e afins · `.env.example` · `migrations/` · OpenAPI · AsyncAPI ·
arquivos de configuração · documentos de negócio · modelos C4 já existentes.

O que vem de lá é **evidência observada**, e se apresenta assim:

> ✅ "Encontrei manifests de PostgreSQL e Redis. Isso diz que os dois existem;
> ainda não sei se pertencem a este recorte, nem como você quer representá-los."

> ❌ "A arquitetura usa PostgreSQL e Redis, e ambos serão modelados."
