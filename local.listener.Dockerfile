FROM node:14.2.0-alpine3.11
WORKDIR /app
COPY ./packages/event-listener/package.json ./packages/event-listener/package-lock.json ./packages/event-listener/babel.config.json  ./
RUN npm install
EXPOSE 8002
CMD ["npm", "start"]