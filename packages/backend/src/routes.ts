import { Router } from 'express';
import authRouter from './routes/auth.router';
import organizationRouter from './routes/organization.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/organizations', organizationRouter);

export default router;
