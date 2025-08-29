import { Router } from 'express';
import authRouter from './routes/auth.router';
import organizationRouter from './routes/organization.router';
import agentRouter from './routes/agent.router';
import filesRouter from './routes/files.router';
import twilioRouter from './routes/twilio.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/organizations', organizationRouter);
router.use('/files', filesRouter);
router.use('/agents', agentRouter);
router.use('/twilio', twilioRouter);

export default router;
