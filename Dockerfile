# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies
RUN npm ci

# Copy all application files
COPY . .

# Build Next.js app
RUN npm run build

# Keep all dependencies (Next.js needs some at runtime)

# Expose port
EXPOSE 3000

# Start custom server with WebSocket support
CMD ["node", "server.js"]
