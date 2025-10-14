FROM node:20-bullseye-slim AS build

WORKDIR /app

# Install minimal system deps
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy package manifests and install only production deps
COPY backend/package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy source
COPY backend/ ./

# Final image: smaller runtime
FROM node:20-bullseye-slim AS runtime
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy application and node_modules from build stage
COPY --from=build /app /app

ENV NODE_ENV=production
EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD curl -f http://localhost:3333/api/clients || exit 1

CMD ["npm", "start"]
