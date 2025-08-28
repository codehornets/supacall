import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = Router();

// Validation schemas
const registerSchema = {
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
  }),
};

const loginSchema = {
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
};

const verifyEmailSchema = {
  body: z.object({
    email: z.email("Invalid email address"),
    code: z.string().length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Code must contain only numbers"),
  }),
};

const refreshTokenSchema = {
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
};

// Routes
router.post(
  '/register',
  validateRequest(registerSchema),
  async (req, res, next) => {
    try {
      const result = await AuthService.register(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  validateRequest(loginSchema),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/verify-email',
  validateRequest(verifyEmailSchema),
  async (req, res, next) => {
    try {
      const { email, code } = req.body;
      await AuthService.verifyEmail(email, code);
      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      res.json(tokens);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/logout',
  authMiddleware({ requiresEmailVerification: true, requiresOrg: false }),
  validateRequest(refreshTokenSchema),
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/logout-all',
  authMiddleware({ requiresEmailVerification: true, requiresOrg: false }),
  async (req, res, next) => {
    try {
      await AuthService.logoutAll(res.locals.user.id);
      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/me',
  authMiddleware({ requiresEmailVerification: false, requiresOrg: false }),
  async (req, res, next) => {
    try {
      const result = await AuthService.getCurrentUser(res.locals.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
router.use((err: any, req: any, res: any, next: any) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  next(err);
});

export default router;