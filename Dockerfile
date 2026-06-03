# ---- Build stage: compile the Vite app ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* vars at build time, so they must be present here.
ARG VITE_BASE44_APP_ID
ARG VITE_BASE44_APP_BASE_URL
ENV VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID
ENV VITE_BASE44_APP_BASE_URL=$VITE_BASE44_APP_BASE_URL

RUN npm run build

# ---- Runtime stage: serve the static build with nginx ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run sends traffic to $PORT (defaults to 8080).
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
