import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/db';

export const agentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentId = req.params.agentId;
    const orgId = res.locals.org;

    // Check if agentId is provided
    if (!agentId) {
      return res.status(400).json({ message: 'Agent ID is required' });
    }

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
