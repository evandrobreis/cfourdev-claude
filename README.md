# Sobre

O [cfourdev](https://cfourdev.com.br) é uma plataforma criada para ajudar times de tecnologia a
manter sua arquitetura de software documentada em um modelo versionado, compartilhável, colaborativo
e centralizado.

O funcionamento é simples:

1. O modelo é escrito em YAML no seu repositório git em um formato aberto e [documentado](https://cfourdev.com.br/docs/);
2. Utilize a [CLI](https://www.npmjs.com/package/cfour-cli) para validar, visualizar e publicar a documentação;
3. Utilize o [portal](https://app.cfourdev.com.br) para visualizar a arquitetura de forma centralizada.

## O que este plugin faz

Este plugin é um complemento à ferramenta. A ideia é ter um conjunto de skills que ajudarão o profissional 
não apenas na escrita dos arquivos YAML, mas também na escolha adequada da estratégia de modelagem, 
avaliação das melhores alternativas arquiteturais, uso da ferramenta de linha de comando, validação e visualização
dos diagramas, etc.

## Instalar

Para instalar o plugin basta adicionar este repositório como marketplace no seu Claude Code.

```
/plugin marketplace add evandrobreis/cfourdev-claude

/plugin install cfour@cfourdev
```

Depois, no repositório onde você vai modelar, rode o setup e inicie a conversa utilizando linguagem natural:

```
/cfour:setup
```

## As skills

O núcleo roteia sozinho — você conversa, não escolhe comando.

| Arquivo | Descrição |
|---|---|
| `cfour:modelagem` | o núcleo: método, guarda-corpos, modelagem ativa, roteamento |
| `cfour:setup` | confere CLI, registro e memória antiga; oferece o que falta |
| `cfour:descoberta` | objetivo, audiência, escopo, perfil de complexidade, cobertura técnica, e o que o leitor vai querer isolar e ver por cor |
| `cfour:estrategia` | organização, projetos, taxonomia, visões e o plano de ondas |
| `cfour:entrevista` | o arquiteto descreve; a skill separa fato de inferência |
| `cfour:editor` | escreve e altera o YAML, pelo contrato, e valida |
| `cfour:documentacao` | busca o contrato do formato num endereço só, e mantém o cache local rastreável |
| `cfour:revisao` | revisa em quatro dimensões separadas |
| `cfour:modelagens` | lista, cria, troca e registra as realidades paralelas |
| `cfour:retomar` | carrega a memória e diz em que etapa o trabalho parou |
| `cfour:encerrar` | consolida o que virou fato e grava o resumo do dia |
| `cfour:reconciliar` | acha onde memória e modelo divergiram |
| `cfour:operar` | `serve`, `check --all`, `login`, `push`, `status` |
| `cfour:avaliar` | a suíte que valida **este plugin**; é para quem o desenvolve |

## Licença

Uso livre, inclusive comercial; não redistribua fora do marketplace. **O que o
plugin escreve a seu pedido é seu.** Veja `LICENSE` — são doze linhas.

## Referências

- Plataforma — [cfourdev.com.br](https://cfourdev.com.br)
- Documentação — [cfourdev.com.br/docs](https://cfourdev.com.br/docs/)
- CLI no npm — [npmjs.com/package/cfour-cli](https://www.npmjs.com/package/cfour-cli)
- Este repositório — [github.com/evandrobreis/cfourdev-claude](https://github.com/evandrobreis/cfourdev-claude)
