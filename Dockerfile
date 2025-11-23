# ---------------------------------------
# 1) BUILD STAGE
# ---------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install deps first for caching
COPY package*.json ./
RUN npm ci

# Copy all project files
COPY . .

# Build frontend using Vite
RUN npm run build


# ---------------------------------------
# 2) RUNNER STAGE
# ---------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Copy only package files for production install
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build output + backend server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
