FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/mobile-web/package.json apps/mobile-web/package.json
RUN pnpm install --frozen-lockfile
COPY apps/mobile-web apps/mobile-web
RUN pnpm --filter mobile-web build
FROM nginx:1.27-alpine
COPY infra/nginx/spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/mobile-web/dist /usr/share/nginx/html
