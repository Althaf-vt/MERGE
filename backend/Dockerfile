# --- Stage 1: Development ---
# We use the alpine version for a smaller, more secure footprint
FROM node:20-alpine As development

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for Nest CLI)
RUN npm install

# Copy the rest of the rest of the application code
COPY . .

# Copy the TypeScript code into JavaScript
RUN npm run build

# --- Stage 2: Production ---
FROM node:20-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

# Install ONLY production dependencies to keep the image lightweight and secure
RUN npm ci --only=production

# Copy the compiled output from the development state
COPY --from=development /usr/src/app/dist ./dist

# Start the application
CMD ["node", "dist/main"]