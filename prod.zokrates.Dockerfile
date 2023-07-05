FROM zokrates/zokrates:0.7.6 as zokrates-builder

FROM node:14 AS builder
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node ./packages/zokrates-worker/package.json ./packages/zokrates-worker/package-lock.json ./packages/zokrates-worker/babel.config.json ./
RUN npm ci
COPY --chown=node:node ./packages/zokrates-worker/src ./src
RUN npm run build

FROM node:14 AS prod-dependencies
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node ./packages/zokrates-worker/package.json ./packages/zokrates-worker/package-lock.json ./
RUN npm ci --only=prod

FROM node:14
# RUN apt-get update -y
ENV NODE_ENV production
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY --chown=node:node ./packages/zokrates-worker/package.json ./packages/zokrates-worker/package-lock.json ./
COPY --chown=node:node ./packages/zokrates-worker/circuits ./circuits
COPY --chown=node:node --from=prod-dependencies /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/build ./build

COPY --from=zokrates-builder /home/zokrates/.zokrates/bin/zokrates ./zokrates
COPY --from=zokrates-builder /home/zokrates/.zokrates/stdlib ./stdlib/
ENV ZOKRATES_HOME /app
ENV ZOKRATES_STDLIB /app/stdlib

EXPOSE 8001
CMD ["npm", "start"]
