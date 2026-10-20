FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
COPY packages/contracts packages/contracts
RUN pnpm --filter api db:generate && pnpm --filter api build
EXPOSE 3000
CMD ["sh","-c","pnpm --filter api db:migrate && pnpm --filter api db:seed && pnpm --filter api start"]
