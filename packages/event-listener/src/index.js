import express from 'express';
import { startConnection } from './app';
import logger from './logger';
import queue from './lib/queue';

const port = process.env.API_PORT || 8002;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const main = async () => {
  await startConnection();
  queue.createQueue();
  app.listen(port, async () => {
    logger.info(`event-listener listening on port: ${port}`);
  });
};

main();
