# Frontend - Docker (dev)

Este diretório contém configurações Docker para rodar o frontend em modo de desenvolvimento.

Objetivos:
- Permitir hot-reload montando o código-fonte via volume
- Aproveitar cache de dependências durante o build
- Evitar problemas de node_modules sobrescrito com volume (usa volume nomeado)
- Healthcheck simples

Comandos úteis (rodar na raiz `admin` ou no diretório com o `docker-compose.yml`):

# Construir a imagem
docker compose -f docker/frontend/dev/docker-compose.yml build

# Subir em modo desenvolvimento
docker compose -f docker/frontend/dev/docker-compose.yml up

# Subir em background
docker compose -f docker/frontend/dev/docker-compose.yml up -d

Notas:
- O código local `frontend/` é montado em `/app` dentro do contêiner. Caso o `node_modules` local cause conflitos, o volume `frontend_node_modules` protege os módulos instalados dentro do contêiner.
- Se usar WSL/VM ou arquivos em rede, pode ser preciso ativar `CHOKIDAR_USEPOLLING=true` (já definido no compose).
- Para produção, use um Dockerfile multi-stage separado que construa os assets estáticos (não use este Dockerfile para produção).
