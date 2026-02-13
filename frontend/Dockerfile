# Step 1: Build the React app
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# For development mode (standard for this project)
EXPOSE 3000
CMD ["npm", "start"]