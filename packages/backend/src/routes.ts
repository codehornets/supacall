import { Router } from 'express';
import authRouter from './routes/auth.router';
import organizationRouter from './routes/organization.router';
import agentRouter from './routes/agent.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/organizations', organizationRouter);
router.use('/agents', agentRouter);

export default router;
