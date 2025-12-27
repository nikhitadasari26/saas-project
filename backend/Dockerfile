FROM node:18-alpine

# Install curl for the mandatory health check
RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# This script will run migrations and then start the server
CMD ["npm", "start"]