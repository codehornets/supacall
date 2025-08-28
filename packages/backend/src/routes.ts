import { Router } from 'express';
import authRouter from './routes/auth.router';
import organizationRouter from './routes/organization.router';
import agentRouter from './routes/agent.router';
import fileRouter from './routes/file.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/organizations', organizationRouter);
router.use('/files', fileRouter);
router.use('/agents', agentRouter);

export default router;
