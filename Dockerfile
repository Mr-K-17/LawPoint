# Node.js + Vite + MongoDB client Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install --production

# Build frontend (if using Vite)
RUN npm run build || true

# Expose port for backend
EXPOSE 5000

# Start server
CMD ["npm", "start"]
