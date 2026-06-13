# Multi-stage Dockerfile for the React frontend.

# ---- Stage 1: build -----------------------------------------------------
# Use Node 22 to compile the React app into static files.
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies first (cached unless package files change).
# "npm ci" does a clean, reproducible install from package-lock.json.
COPY package*.json ./
RUN npm ci

# Copy the rest of the source and build.
COPY . .

# The backend URL is baked into the build (frontend env vars are compile-time).
# Override per environment at build time, e.g.:
#   docker build --build-arg VITE_API_URL=https://api.myapp.com ...
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Produces the static files into /app/dist
RUN npm run build

# ---- Stage 2: serve -----------------------------------------------------
# Start fresh from a tiny nginx image — Node is NOT included here.
FROM nginx:alpine AS serve

# Our nginx config (handles single-page-app routing).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the built static files from the build stage.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Run nginx in the foreground (required so the container stays alive).
CMD ["nginx", "-g", "daemon off;"]
