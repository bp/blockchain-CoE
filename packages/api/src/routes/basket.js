import redis from '../lib/redis';
import express from 'express';
import { onlyDuringVoting, validateSession } from '../middlewares/validator';
import { getContribution } from '../services/contribution';

const router = express.Router();
const redisClient = redis.client();

/**
 * Route helps in adding the projects in the basket to redis cache.
 *
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"1":"1333","2":"","3":"","4":"","5":""}
 */
router.post('/', validateSession, onlyDuringVoting, async function (req, res) {
  try {
    const { user } = req;
    const userId = user._id;
    const basket = req.body;
    const contribution = await getContribution({ userId });
    if (!contribution) {
      await redisClient.set(`basket:${userId}`, JSON.stringify(basket), 'EX', 4 * 24 * 60 * 60); //expire after 4 days
    } else {
      await redisClient.del(`basket:${userId}`);
    }
    return res.json().status(200);
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route helps in fetching the projects from redis cache to display in basket.
 *
 * @name get/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', validateSession, async function (req, res) {
  try {
    const { user } = req;
    const userId = user._id;
    let basket = await redisClient.get(`basket:${userId}`);
    if (basket) {
      basket = JSON.parse(basket);
    }
    return res.json({ basket }).status(200);
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

export default router;
