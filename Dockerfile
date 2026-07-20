FROM oven/bun:1.3.3 AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json bun.lock ./
COPY apps/demo/package.json apps/demo/package.json
COPY packages/toast/package.json packages/toast/package.json
RUN bun install --frozen-lockfile

FROM dependencies AS build
COPY . .
RUN bun --filter @dominikkrakowiak/toast build && bun --filter demo build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/apps/demo/.next/standalone ./
COPY --from=build /app/apps/demo/.next/static ./apps/demo/.next/static
EXPOSE 3000
CMD ["node", "apps/demo/server.js"]
