import app from './app';
import db from './db';
import logger from './logger';
import redis from './lib/redis';

const main = async () => {
  const port = process.env.API_PORT || 8000;

  const exitHandler = () => {
    if (server) {
      server.close(() => {
        logger.error({
          msg: 'ERROR',
          data: 'Server Closed'
        });
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  };

  const unexpectedErrorHandler = (error) => {
    logger.error({
      msg: 'ERROR',
      data: error
    });
    exitHandler();
  };

  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  process.on('SIGTERM', () => {
    logger.info({
      msg: `SIGTERM recieved`
    });
    if (server) {
      server.close();
    }
  });

  await db.connectMongoose();
  redis.connect();
  const server = app.listen(port, () => {
    logger.info({
      msg: `api listening on port: ${port}`
    });
  });
};

main();

//calling azure service bus MQ in an interval of 15 secs
// setInterval(receiveMessage, 15000);
