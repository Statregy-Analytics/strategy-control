# Backend development Dockerfile (Node.js)
FROM node:20-bullseye-slim

WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl jq \
	&& rm -rf /var/lib/apt/lists/*

# Copiar somente arquivos de dependências e instalar para aproveitar cache
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund

# Criar diretório para código e expor porta padrão da API
WORKDIR /app

# Copy entrypoint script and make executable
COPY backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Por padrão o compose irá montar o código do host em /app
EXPOSE 3333

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:3333/api/clients || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
