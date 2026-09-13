# ---- Build stage: install deps and build static assets with Vite ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes these into the bundle at build time (not runtime), so they must
# be passed in as build args. Render auto-passes dashboard env vars as build
# ARGs; locally pass them with --build-arg.
ARG VITE_API_BASE_URL
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# ---- Runtime stage: serve the built static files with nginx ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# nginx's official image envsubst's *.template files at startup, so the
# ${PORT} Render injects at runtime gets substituted into the real config.
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
