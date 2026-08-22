set -e
mkdir -p loja pagamentos
(cd loja && cfour init --id loja --nome "Loja Online" --json >/dev/null && cfour element add "SAP" --shape external --json >/dev/null)
(cd pagamentos && cfour init --id pagamentos --nome "Gateway de Pagamentos" --json >/dev/null && cfour element add "SAP" --shape external --json >/dev/null)
(cd pagamentos && cfour uses add ../loja --json >/dev/null)
