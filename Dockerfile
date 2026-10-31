# ==============================================================================
# Cognitor Catalog: Multi-Stage Production Build
# License: Apache-2.0
# ==============================================================================

FROM node:22-alpine AS build

WORKDIR /app

# Copy root manifests
COPY package*.json tsconfig*.json ./
RUN npm ci

# Copy server sources and compile
COPY src/server ./src/server
RUN npm run build:server

# Build frontend Angular app
COPY src/frontend/package*.json ./src/frontend/
WORKDIR /app/src/frontend
RUN npm ci

COPY src/frontend/ ./
RUN npm run build

# Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=4200 \
    BASE_PATH=/catalog/ \
    CATALOG_ROOT_DIR=/workspaces

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/frontend/dist/frontend/browser ./dist/frontend/dist/frontend/browser

EXPOSE 4200

CMD ["node", "dist/server/index.js"]
