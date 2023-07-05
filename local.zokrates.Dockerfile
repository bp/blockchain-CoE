FROM zokrates/zokrates:0.7.6 as builder

FROM node:14.17
WORKDIR /app

RUN apt-get update -y

COPY ./packages/zokrates-worker/package.json ./packages/zokrates-worker/package-lock.json ./packages/zokrates-worker/babel.config.json ./
RUN npm install

COPY --from=builder /home/zokrates/.zokrates/bin/zokrates /app/zokrates
COPY --from=builder /home/zokrates/.zokrates/stdlib /app/stdlib/
ENV ZOKRATES_HOME /app
ENV ZOKRATES_STDLIB /app/stdlib

EXPOSE 8001
CMD ["npm", "start"]