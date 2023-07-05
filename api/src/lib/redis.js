import Redis from 'ioredis';
import { redisUrl } from './config';
import logger from '../logger';

// logger.info('redisUrl ', redisUrl);
logger.info(
  {
    msg: 'redisUrl',
    service: 'api'
  },
  redisUrl
);
/**
 * Creates an instance to the redis cache and establishes connection to it
 *  @returns redis client
 */
const RedisCache = () => {
  let redisClient;
  const connect = () => {
    try {
      redisClient = new Redis(redisUrl);
      return redisClient;
    } catch (error) {
      // logger.error('ERROR at redisCache ', error.message);
      logger.error(
        {
          msg: 'ERROR at redisCache'
        },
        error.message
      );
      return {};
    }
  };

  return {
    connect,
    client: () => {
      if (redisClient === undefined) {
        redisClient = new Redis(redisUrl);
      }
      return new Redis(redisUrl);
    }
  };
};

export default RedisCache();
