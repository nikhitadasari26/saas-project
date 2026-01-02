# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all backend source code
COPY . .

# Expose the port your server runs on
EXPOSE 5000

# Start the application
CMD ["npm", "start"]