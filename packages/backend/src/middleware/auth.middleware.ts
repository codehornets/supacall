import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db';

interface JwtPayload {
  userId: string;
}

interface AuthMiddlewareOptions {
  requiresEmailVerification?: boolean;
  requiresOrg?: boolean;
}

export const authMiddleware = (options: AuthMiddlewareOptions = { requiresEmailVerification: true, requiresOrg: true }) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const orgId = req.headers['x-org-id'] as string;

    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          organizations: {
            where: orgId ? { organizationId: orgId } : undefined,
          },
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (options.requiresEmailVerification && !user.isVerified) {
        return res.status(403).json({ message: 'Email not verified' });
      }

      // Set user context
      res.locals.user = user;

      if(options.requiresOrg && !orgId) {
        return res.status(403).json({ message: 'Organization ID is required' });
      }

      // Set org context if org ID is provided
      if (orgId) {
        const orgMembership = user.organizations[0];
        if (options.requiresOrg && !orgMembership) {
          return res.status(403).json({ message: 'User not a member of this organization' });
        }
        if (orgMembership) {
          res.locals.org = orgMembership;
        }
      }

      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    next(error);
  }
};
