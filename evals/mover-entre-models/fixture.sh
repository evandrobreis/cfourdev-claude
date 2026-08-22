set -e
mkdir -p loja && cd loja
cfour init --id loja --nome "Loja Online" --json >/dev/null
SITE=$(cfour element list --json | python3 -c "import sys,json;print([e['id'] for e in json.load(sys.stdin)['elements'] if e['name']=='Site'][0])")
cfour model add compartilhado --json >/dev/null
cfour element add "Worker de Pedidos" --parent "$SITE" --model ola --json >/dev/null
cfour element add "Fila" --parent "$SITE" --shape queue --model ola --json >/dev/null
cfour relation add "Fila" "Worker de Pedidos" --json >/dev/null
