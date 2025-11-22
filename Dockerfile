# ----------------------------
# 1) BUILD STAGE
# ----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend (Vite)
RUN npm run build

# ----------------------------
# 2) RUNNER STAGE
# ----------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only required files
COPY package*.json ./

# Install ONLY production deps
RUN npm ci --omit=dev

# Copy built frontend & server code
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose port
EXPOSE 5000

# Start with relaxed TLS for MongoDB Atlas compatibility
CMD ["node", "--tls-min-v1.0", "server.js"]
