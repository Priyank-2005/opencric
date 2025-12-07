# filepath: frontend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
# Update the command to force Webpack
# This ensures the polling config in next.config.ts is actually used
CMD ["npx", "next", "dev", "--webpack"]