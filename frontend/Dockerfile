FROM node:24-alpine AS build
WORKDIR /workspace

RUN npm install --global pnpm@11.19.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY index.html tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts ./
COPY public/ public/
COPY src/ src/
RUN pnpm run build
RUN test -f dist/quake-mark.svg

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist/ /usr/share/nginx/html/

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
    CMD wget -qO- http://localhost:8080/healthz || exit 1
