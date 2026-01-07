# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install
RUN apk add --no-cache postgresql-client

# Copy all backend source code
COPY . .

# Expose the port your server runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
