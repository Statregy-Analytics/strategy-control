Script para popular clientes no backend

Uso rápido:

- Inicie o backend (padrão http://localhost:3333)
- Rode:

```
node scripts/populate_clients.js --count 50
```

Opções:

- --count, -c: quantidade de clientes a inserir (padrão 10)
- --base-url, -b: URL base do backend (ex: http://localhost:3333). Alternativamente use variável de ambiente BASE_URL

Exemplo:

```
BASE_URL=http://localhost:3333 node scripts/populate_clients.js -c 100
```

Novas opções e scripts adicionais

- --concurrency, -p: número de requisições concorrentes ao usar `populate_clients.js` (padrão 1). Use para acelerar inserções via API.

Há também um script que insere direto no SQLite (não precisa do backend rodando):

```
node scripts/populate_clients_db.js --count 50
```

Opções do script DB:

- --db PATH: caminho para o arquivo sqlite a usar (override de SQLITE_FILE). Ex: --db ./backend/dev.sqlite

Payload gerado
O payload gerado é compatível com o `useCliente` do frontend e inclui campos como:

- cliente: { cpf_cnpj, renda, profissao, birth, name, avatar, email }
- weLend: array de contratos/loans com campos (status, valor, data_loan, value_dividendo, number_parcelas, contrato, vigencia, saldo, ...)
- investment: { classification, saldo, assessor, data_dividendo, valor_dividendo }
- bank, residential: objetos vazios por padrão (pode ser estendido)
- bankRegister: lista com um registro bancário (chave_pix, cpf_cnpj, name, agency, account, type, status)
- assessor, saldo, contrato, dividendo, emprestimo

Se quiser que eu popule ainda mais campos específicos (por ex. dados completos de `bank` ou `residential`) ou que adicione CNPJ alternados, eu adapto o gerador.

Multiprocessamento

O `populate_clients.js` agora suporta dividir a carga entre múltiplos processos para usar melhor CPUs/IO. Use a opção:

- --processes, -m: número de processos a spawnar. O pedido total (`--count`) será dividido entre os processos igualmente (o resto distribuído entre os primeiros).

Exemplo: spawn 4 processos e 5 requisições concorrentes por processo

```
BASE_URL=http://localhost:3333 node scripts/populate_clients.js --count 500 --processes 4 --concurrency 5
```

Observação: cada processo também aceita `--concurrency` para controlar paralelismo dentro do processo.

---

Adicionar novo script: populate_all_api.sh

O workspace agora inclui `scripts/populate_all_api.sh`, um script bash que gera dados de `advisors`, `clients` e `leads` e insere via API em `/api/advisors`, `/api/clients` e `/api/leads`.

Uso rápido:

```bash
./scripts/populate_all_api.sh --count 20
```

Para rodar dentro de um container (usa `docker exec -i <container> curl ...`):

```bash
./scripts/backend/populate_all_api.sh --count 20 --container backend
```

Para limpar os registros antes de inserir (requer `jq` para listar ids):

```bash
./scripts/backend/populate_all_api.sh --clear
```

Veja o topo do arquivo para todas as flags suportadas e notas.
