# Step 1: Use an official Node.js image from the Docker Hub
FROM node:16

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Step 4: Install project dependencies
RUN npm install

# Step 5: Copy the rest of the application files to the container
COPY . .

# Step 6: Expose port 5000 (you specified PORT as 5000)
EXPOSE 5000

# Step 7: Start the application
CMD ["npm", "start"]
