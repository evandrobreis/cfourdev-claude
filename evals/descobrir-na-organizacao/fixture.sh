set -e
mkdir -p loja && cd loja
cfour init --id loja --nome "Loja Online" --json >/dev/null
SITE=$(cfour element list --json | python3 -c "import sys,json;print([e['id'] for e in json.load(sys.stdin)['elements'] if e['name']=='Site'][0])")
cfour element add "API" --parent "$SITE" --json >/dev/null
