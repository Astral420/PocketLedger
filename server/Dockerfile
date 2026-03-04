# server/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Expose your API port
EXPOSE 3000

# Run in dev mode (ts-node-dev)
CMD ["npm", "run", "dev"]