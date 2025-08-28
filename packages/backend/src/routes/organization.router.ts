import { Router } from 'express';
import { OrganizationService } from '../services/organization.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';

const router = Router();

// Validation schemas
const createOrgSchema = {
  body: z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
  }),
};

const updateOrgSchema = {
  body: z.object({
    name: z.string().min(2, "Organization name must be at least 2 characters"),
  }),
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
};

const getOrgSchema = {
  params: z.object({
    id: z.string().uuid("Invalid organization ID"),
  }),
};

// All routes require authentication
router.use(authMiddleware());

// Get user's organizations
router.get('/', async (req, res, next) => {
  try {
    const organizations = await OrganizationService.getUserOrganizations(res.locals.user.id);
    res.json(organizations);
  } catch (error) {
    next(error);
  }
});

// Create new organization
router.post(
  '/',
  validateRequest(createOrgSchema),
  async (req, res, next) => {
    try {
      const organization = await OrganizationService.createOrganization(
        req.body.name,
        res.locals.user.id
      );
      res.status(201).json(organization);
    } catch (error) {
      next(error);
    }
  }
);

// Get specific organization
router.get(
  '/:id',
  validateRequest(getOrgSchema),
  async (req, res, next) => {
    try {
      const organization = await OrganizationService.getOrganization(
        req.params.id,
        res.locals.user.id
      );
      res.json(organization);
    } catch (error) {
      next(error);
    }
  }
);

// Update organization
router.put(
  '/:id',
  validateRequest(updateOrgSchema),
  async (req, res, next) => {
    try {
      const organization = await OrganizationService.updateOrganization(
        req.params.id,
        res.locals.user.id,
        req.body.name
      );
      res.json(organization);
    } catch (error) {
      next(error);
    }
  }
);

// Delete organization
router.delete(
  '/:id',
  validateRequest(getOrgSchema),
  async (req, res, next) => {
    try {
      await OrganizationService.deleteOrganization(
        req.params.id,
        res.locals.user.id
      );
      res.status(204).send();
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
