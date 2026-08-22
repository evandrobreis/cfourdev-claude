set -e
mkdir -p src/pedidos src/relatorios
cat > package.json <<'JSON'
{ "name": "atlas", "version": "0.1.0", "dependencies": { "express": "^4.19.0", "pg": "^8.11.0" } }
JSON
echo "export const rotas = []" > src/pedidos/index.js
echo "export const rotas = []" > src/relatorios/index.js
echo "# atlas" > README.md
