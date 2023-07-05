import logger from './logger';
import mongoose from 'mongoose';
import { insertProjects } from './services/projects';
import { insertNewContract } from './services/contract';

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
  // useFindAndModify: false,
  // useCreateIndex: true,
};

const wait = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));

export default {
  connectMongoose: async () => {
    for (let i = 0; i < (process.env.MONGO_CONNECTION_RETRIES || 5); i += 1) {
      try {
        mongoose.connection.on('connected', async () => {
          await insertProjects();
          await insertNewContract();
          logger.info({
            msg: `inserted projects`
          });
          logger.info({
            msg: `contract inserted`
          });
        });
        await mongoose.connect(`${process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/'}`, options);
        logger.info({
          msg: `Mongoose connected to db`
        });
        // if (mongoose.connection.readyState) {
        //   await insertProjects();
        // }
        break;
      } catch (error) {
        const delayTime = 500;
        logger.error({
          msg: 'ERROR',
          data: error
        });
        logger.info({
          msg: `Retrying Mongoose connection in ${delayTime} ms`
        });
        await wait(delayTime);
      }
    }
  }
};
