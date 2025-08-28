import { Router } from "express";
import { prisma } from "../lib/db";
import { authMiddleware } from "../middleware/auth.middleware";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const router = Router();

// Schema for creating/updating an agent
const createAgentSchema = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    allowWebsite: z.boolean().optional().default(true),
    allowPhone: z.boolean().optional().default(false),
  }),
};

// Schema for params with ID
const idParamSchema = {
  params: z.object({
    id: z.string().min(1, "ID is required"),
  }),
};

router.use(authMiddleware());

// Get all agents for the organization
router.get("/", async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: {
        organizationId: res.locals.org,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

// Create a new agent
router.post("/",
  validateRequest(createAgentSchema),
  async (req, res) => {
    try {
      const agent = await prisma.agent.create({
        data: {
          ...req.body,
          organizationId: res.locals.org,
        },
      });
      res.json(agent);
    } catch (error) {
      console.error("Error creating agent:", error);
      res.status(500).json({ error: "Failed to create agent" });
    }
  }
);

// Update an agent
router.put("/:id",
  validateRequest({
    body: createAgentSchema.body,
    params: idParamSchema.params,
  }),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify agent belongs to organization
      const existingAgent = await prisma.agent.findFirst({
        where: {
          id,
          organizationId: res.locals.org,
        },
      });

      if (!existingAgent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const agent = await prisma.agent.update({
        where: { id },
        data: req.body,
      });
      res.json(agent);
    } catch (error) {
      console.error("Error updating agent:", error);
      res.status(500).json({ error: "Failed to update agent" });
    }
  }
);

// Delete an agent
router.delete("/:id",
  validateRequest(idParamSchema),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Verify agent belongs to organization
      const existingAgent = await prisma.agent.findFirst({
        where: {
          id,
          organizationId: res.locals.org,
        },
      });

      if (!existingAgent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      await prisma.agent.delete({
        where: { id },
      });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ error: "Failed to delete agent" });
    }
  }
);

export default router;