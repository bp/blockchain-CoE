import express from 'express';
import redis from '../lib/redis';
import { itxKey } from '../lib/config';
import { getItxBalance } from '../services/itx';

const router = express.Router();

/**
 * Route to fetch the balance of itx account
 * @name get/balance
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/balance', async function (req, res) {
  try {
    const { address } = itxKey;
    const redisClient = redis.client();
    const key = `itx-balance-${address}`;
    const cacheBalance = await redisClient.get(key);
    if (cacheBalance) {
      return res.json({ balance: Number(JSON.parse(cacheBalance)) }).status(200);
    } else {
      const itxBalanceResponse = await getItxBalance();
      if (itxBalanceResponse?.balance) {
        await redisClient.set(key, JSON.stringify(itxBalanceResponse.balance), 'EX', 1 * 60 * 60); // expire in 1 hour
      }
      return res.json({ balance: Number(itxBalanceResponse.balance) }).status(200);
    }
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

export default router;
