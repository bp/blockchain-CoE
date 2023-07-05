FROM node:14.2.0-alpine3.11 AS builder
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node ./packages/api/package.json ./packages/api/package-lock.json ./packages/api/babel.config.json ./
RUN npm ci
COPY --chown=node:node ./packages/api/src ./src
COPY --chown=node:node ./artifacts ./artifacts
RUN npm run build

FROM node:14.2.0-alpine3.11 AS prod-dependencies
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node ./packages/api/package.json ./packages/api/package-lock.json ./
RUN npm ci --only=prod

FROM node:14.2.0-alpine3.11
ENV NODE_ENV production
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --chown=node:node ./packages/api/package.json ./packages/api/package-lock.json ./
COPY --chown=node:node ./artifacts ./artifacts
COPY --chown=node:node --from=prod-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/build ./build
EXPOSE 8000
CMD ["npm", "start"]
