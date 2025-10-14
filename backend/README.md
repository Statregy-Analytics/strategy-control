# Backend (modo desenvolvimento)

Este micro-serviço minimal implementa um CRUD de clientes para desenvolvimento.

## Como funciona

- Por padrão, em desenvolvimento, você pode usar dados fakes definindo `USE_FAKES=true` no arquivo `.env.development`.
- Para usar sqlite, defina `USE_FAKES=false` e ajuste `SQLITE_FILE` se necessário.

## Instruções rápidas

1. Instale dependências:

   npm install

2. Rodar em modo desenvolvimento (usa .env.development):

   cp .env.development .env
   npm run dev

3. Endpoints principais:

- GET /api/clients -> lista clientes
- GET /api/clients/:id -> obtém cliente
- POST /api/clients -> cria cliente
- PUT /api/clients/:id -> atualiza cliente
- DELETE /api/clients/:id -> remove cliente

## Desenvolvimento com Docker (script `dev_up`)

Este repositório fornece um script conveniente `./scripts/dev_up` que sobe o backend e o frontend em modo de desenvolvimento usando Docker Compose.

O fluxo principal do script:

- Constrói as imagens (com cache quando possível)
- Sobe o container do backend e aguarda o endpoint `http://localhost:3333/api/clients` ficar saudável
- Sobe o container do frontend e aguarda sua healthcheck

Uso:

```bash
# do diretório raiz do projeto
./scripts/dev_up
```

### Por que pode ocorrer o erro "Cannot find module 'joi'"?

- O `docker-compose` normalmente monta o diretório do host em `/app` dentro do container. Se os `node_modules` foram instalados durante o build da imagem, esse diretório pode ser sobrescrito pelo bind-mount do host e, com isso, os pacotes não ficam visíveis no container.
- Para contornar isso no ambiente de desenvolvimento, o container inclui um `entrypoint` que verifica se `node_modules` está vazio ou se o pacote `joi` está ausente — e, nesses casos, roda `npm install` durante o start do container.

### Troubleshooting e comandos úteis

- Ver logs do backend:

```bash
docker compose -f docker/backend/dev/docker-compose.yml logs -f strategy-backend-dev
```

- Forçar rebuild e reiniciar (remove containers antigos):

```bash
docker compose -f docker/backend/dev/docker-compose.yml down --remove-orphans
docker compose -f docker/backend/dev/docker-compose.yml up -d --build
```

- Limpar o volume de node_modules (uma vez) para forçar re-instalação:

```bash
# liste volumes e remova o volume named usado pelo compose se existir
docker volume ls
docker volume rm <strategy_backend_node_modules>
```

- Rodar testes no container (Jest):

```bash
# executa npm test dentro do container
docker compose -f docker/backend/dev/docker-compose.yml exec strategy-backend-dev npm test -- --runInBand
```

Se quiser, posso adicionar uma seção semelhante no README raiz com links e instruções de troubleshooting para o desenvolvedor.
