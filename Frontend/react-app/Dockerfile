# ---------- build stage ----------
FROM node:22-alpine AS build

WORKDIR /app

# Only package.json: the committed package-lock.json was generated on Windows and
# carries only the win32 rollup/esbuild binaries, so installing against it on
# linux leaves the native module missing (npm/cli#4828). Resolving fresh here
# pulls the correct linux binaries.
COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .

# Backend origin baked into the bundle at build time (Vite inlines VITE_* vars).
ARG VITE_API_BASE_URL=https://interlink-app-f4sd.onrender.com
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Optional overrides. Left undeclared they stay out of the environment, so the
# values in .env (copied above) are used instead.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

RUN npm run build

# ---------- runtime stage ----------
FROM nginx:1.27-alpine AS runtime

# The nginx entrypoint renders /etc/nginx/templates/*.template into conf.d,
# substituting env vars, so PORT is configurable at `docker run` time.
ENV PORT=80

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
