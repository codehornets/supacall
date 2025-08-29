import { Router } from 'express';
import authRouter from './auth.router';
import agentRouter from './agent.router';
import knowledgeBaseRouter from './knowledgebase.router';
import filesRouter from './files.router';
import twilioRouter from './twilio.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/agents', agentRouter);
router.use('/knowledge-base', knowledgeBaseRouter);
router.use('/files', filesRouter);
router.use('/agents', twilioRouter);

export default router;
