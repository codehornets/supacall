import { Router } from 'express';
import { authRouter } from './auth.router';
import { agentRouter } from './agent.router';
import knowledgeBaseRouter from './knowledgebase.router';
import fileRouter from './file.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/agents', agentRouter);
router.use('/knowledge-base', knowledgeBaseRouter);
router.use('/files', fileRouter);

export default router;
