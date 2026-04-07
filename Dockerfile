# Development Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose Next.js default port
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "dev"]
