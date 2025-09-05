# Use Node.js 20 official image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Copy server source files for WebSocket functionality
COPY src/lib/server src/lib/server
COPY src/lib/api src/lib/api
COPY src/lib/utils src/lib/utils

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "build"]
