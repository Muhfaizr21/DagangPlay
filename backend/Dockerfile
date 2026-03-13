FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and required libs for Prisma
RUN apk add --no-cache openssl libc6-compat
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Build the backend application
RUN npm run build

# Expose the API port
EXPOSE 3001

# Start the built application
CMD ["node", "dist/src/main"]
