# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy xray-lib
COPY xray-lib/dist ./xray-lib/dist
COPY xray-lib/package.json ./xray-lib/package.json

# Copy backend files
WORKDIR /app/backend
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY backend/ ./

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]
