import Redis from 'ioredis';

export const redisUrl = process.env.REDIS_URL;

const RedisCache = () => {
  let redisClient;
  const connect = () => {
    try {
      redisClient = new Redis(redisUrl);
      return redisClient;
    } catch (error) {
      console.log(error);
      return {};
    }
  };

  return {
    connect,
    client: () => {
      if (redisClient === undefined) {
        connect();
      }
      return redisClient;
    }
  };
};

export default RedisCache();
