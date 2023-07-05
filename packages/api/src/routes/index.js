import express from 'express';
import userRouter from './user';
import loginRouter from './login';
import projectsRouter from './projects';
import notificationRouter from './notification';
import contractRouter from './contract';
import contributionRouter from './contribution';
import basketRouter from './basket';
import kycRouter from './kyc';
import itxRouter from './itx';
import qfRouter from './quadraticFunding';
import distributeFundsRouter from './distributeFunds';
import proofRouter from './proof';

const router = express.Router();
router.use('/user', userRouter);
router.use('/projects', projectsRouter);
router.use('/login', loginRouter);
router.use('/notification', notificationRouter);
router.use('/contract', contractRouter);
router.use('/contribution', contributionRouter);
router.use('/basket', basketRouter);
router.use('/kyc', kycRouter);
router.use('/itx', itxRouter);
router.use('/quadraticFunding', qfRouter);
router.use('/distributeFunds', distributeFundsRouter);
router.use('/proof', proofRouter);

export default router;
