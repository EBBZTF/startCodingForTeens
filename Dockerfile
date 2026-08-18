FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY main.ts ./
RUN npm run build

FROM nginx:alpine
COPY index.html styles.css img.png platformer-demo.py /usr/share/nginx/html/
COPY --from=build /app/main.js /usr/share/nginx/html/main.js
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1
