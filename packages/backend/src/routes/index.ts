import { Router } from 'express';
import { authRouter } from './auth.router';
import { agentRouter } from './agent.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/agents', agentRouter);

export default router;
