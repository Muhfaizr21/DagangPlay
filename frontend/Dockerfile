FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for node-gyp and Alpine specific deps
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies (ignoring scripts in case of native build errors)
RUN npm install

# Copy application files
COPY . .

# Build Next.js application (Needs env vars)
# Note: Since it builds static pages, NEXT_PUBLIC vars from .env will be baked in
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
