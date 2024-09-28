# Use a more recent Node.js version
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN yarn build

# Expose the port the app runs on
EXPOSE 8080 80

# Command to run the application in development mode
CMD ["yarn", "start:dev"]