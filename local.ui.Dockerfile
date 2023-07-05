FROM node:14.2.0-alpine3.11
WORKDIR /app
COPY ./packages/ui/package.json ./packages/ui/package-lock.json ./
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]