import express from 'express';
import { getAllGetNotifiedEmails, insertGetNotifiedEmail } from '../services/notification';
import { onlyAdmin, validate, validateNotification } from '../middlewares/validator';

const router = express.Router();

/**
 * Route to fetch all emails subscribed for notifications
 * @name get/
 * @param {string} path - Express path
 * @param {string} email - email address of the user
 * @param {callback} middleware - Express middleware.
 */
router.get('/', onlyAdmin, async function (req, res) {
  try {
    const emails = await getAllGetNotifiedEmails();
    return res.status(200).json({ emails });
  } catch (error) {
    return res.status(400).json({ errors: [error.message] });
  }
});

/**
 * Route to register email for getting notifications
 * @name post/
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * expected request.body : {"email":"test@testmail.com"}
 */
router.post('/', validateNotification(), validate, async function (req, res) {
  try {
    const { email } = req.body;
    await insertGetNotifiedEmail({ email });
    return res.status(201).send();
  } catch (error) {
    return res.status(201).send();
  }
});

export default router;
