# Stage 1: Build
FROM docker.io/library/node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve
# Stage 2: Serve
FROM docker.io/library/node:20-alpine

WORKDIR /app

# Copy server dependencies
COPY server/package*.json ./
RUN npm ci --production

# Copy server code
COPY server/ ./

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Expose port 8080 (matched in server/index.js)
EXPOSE 8080

# Set absolute path for dist in container environment
ENV DIST_PATH=/app/dist

# Start Node Server
CMD ["node", "index.js"]
