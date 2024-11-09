# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the application will run on
EXPOSE 8080

# Set environment variables (you can also set these in a .env file and pass it in at runtime)
ENV NODE_ENV=production

# Run the application
CMD ["node", "app.js"]