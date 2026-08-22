set -e
mkdir -p loja pagamentos
(cd loja && cfour init --id loja --nome "Loja Online" --json >/dev/null)
(cd pagamentos && cfour init --id pagamentos --nome "Gateway de Pagamentos" --json >/dev/null)
