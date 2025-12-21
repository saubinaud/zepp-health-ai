FROM node:20-alpine

# Install wget for healthchecks
RUN apk add --no-cache wget

WORKDIR /app

# Install ALL dependencies (including dev for build)
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
