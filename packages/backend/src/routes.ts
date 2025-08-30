import { Router } from 'express';
import authRouter from './routes/auth.router';
import organizationRouter from './routes/organization.router';
import agentRouter from './routes/agent.router';
import filesRouter from './routes/files.router';
import twilioRouter from './routes/twilio.router';
import knowledgeBaseRouter from './routes/knowledgebase.router';
import conversationsRouter from './routes/conversations.router';
import contactsRouter from './routes/contacts.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/organizations', organizationRouter);
router.use('/files', filesRouter);
router.use('/agents', agentRouter);


// Agent-specific routes
router.use('/agents/:agentId/knowledge-base', knowledgeBaseRouter);
router.use('/agents/:agentId/twilio', twilioRouter);
router.use('/agents/:agentId/conversations', conversationsRouter);
router.use('/agents/:agentId/contacts', contactsRouter);


export default router;
