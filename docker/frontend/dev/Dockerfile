# Dockerfile para desenvolvimento do Strategy Analytics (frontend)
FROM node:20-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache git

WORKDIR /app

# Copiar somente os manifestos de dependências primeiro para aproveitar cache
COPY frontend/package*.json ./

# Instalar dependências (usa cache de camadas). Em desenvolvimento npm install é mais tolerante
RUN npm install --prefer-offline --no-audit --progress=false

# Copiar o resto do código do frontend
COPY frontend/ ./

EXPOSE 9000

ENV NODE_ENV=development
ENV HOST=0.0.0.0
ENV PORT=9000

# Alvo padrão para desenvolvimento (possível multi-stage para produção separado)
CMD ["npm", "run", "dev"]
