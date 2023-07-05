FROM node:14.2.0-alpine3.11
WORKDIR /app
COPY ./packages/api/package.json ./packages/api/package-lock.json ./packages/api/babel.config.json  ./
RUN npm install
EXPOSE 8000
CMD ["npm", "start"]