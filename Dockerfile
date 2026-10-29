FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build:prod

FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist/prod ./dist/prod
COPY package.json ./
# Uploaded images are written here; mount a persistent volume at /app/uploads so they survive redeploys.
RUN mkdir -p uploads/images
EXPOSE 3000
# Both seeds are idempotent, so they run on every start before the server boots.
CMD ["sh", "-c", "node dist/prod/cli seed:app-config && node dist/prod/cli seed:account && exec node dist/prod/main"]
