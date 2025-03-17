# Build the TypeScript application
FROM node:lts-alpine AS build

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build



# Create the production image
FROM node:lts-alpine AS production

WORKDIR /app
COPY package*.json .
RUN npm install --only=production

# Copy the built files from the previous stage
COPY --from=build /app/dist ./dist

# Run the app
CMD ["node", "dist/index.js"]
