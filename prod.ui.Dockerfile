FROM node:14.2.0-alpine3.11 AS builder
WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node ./packages/ui/package.json ./packages/ui/package-lock.json ./packages/ui/next.config.js ./
RUN npm ci --no-save
COPY --chown=node:node ./packages/ui/components ./components
COPY --chown=node:node ./packages/ui/layouts ./layouts
COPY --chown=node:node ./packages/ui/pages ./pages
COPY --chown=node:node ./packages/ui/public ./public
COPY --chown=node:node ./packages/ui/styles ./styles
COPY --chown=node:node ./packages/ui/lib ./lib
COPY --chown=node:node ./packages/ui/contexts ./contexts
COPY --chown=node:node ./artifacts ./artifacts
RUN npm run build

FROM node:14.2.0-alpine3.11
WORKDIR /app
ENV NODE_ENV production
RUN chown -R node:node /app
USER node
COPY --chown=node:node ./packages/ui/package.json ./packages/ui/package-lock.json ./packages/ui/next.config.js ./
RUN npm ci --only=prod
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node ./packages/ui/public ./public
COPY --chown=node:node ./artifacts ./artifacts
EXPOSE 3000
CMD ["npm", "start"]
