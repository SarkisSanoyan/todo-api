# Use Node LTS
FROM node:20-alpine

# Set working dir
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start app
CMD ["npm", "start"]