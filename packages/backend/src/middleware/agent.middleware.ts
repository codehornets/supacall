import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';

export const agentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get agentId from either params or mergeParams
    const agentId = req.params.agentId || (req as any).agentId;
    const orgId = res.locals.org;

    // Check if agentId is provided
    if (!agentId) {
      return res.status(400).json({ message: 'Agent ID is required' });
    }

    // Store agentId in request for downstream middleware/routes
    (req as any).agentId = agentId;

    // Check if agent exists and belongs to the organization
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        organizationId: orgId,
      },
    });

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found or not part of this organization' });
    }

    next();
  } catch (error) {
    next(error);
  }
};
