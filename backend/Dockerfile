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
COPY seed_data.sql .


# Expose the port your server runs on
EXPOSE 5000

# Start the application
CMD [sh -c "npm run migrate && npm run seed && npm start"]
