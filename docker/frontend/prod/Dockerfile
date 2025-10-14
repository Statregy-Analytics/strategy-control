# Stage 1: build the frontend using node
FROM node:20-alpine AS build

WORKDIR /app

RUN apk add --no-cache git python3 make g++

# Copy manifests and install
COPY frontend/package*.json ./
RUN npm ci --no-audit --progress=false

# Copy source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: serve built files with nginx
FROM nginx:1.25-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: custom nginx config could be added here
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
