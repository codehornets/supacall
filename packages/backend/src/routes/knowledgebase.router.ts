import { Router } from "express";
import { KnowledgeBaseService } from "../services/knowledgebase.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { agentMiddleware } from "../middleware/agent.middleware";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const router = Router({ mergeParams: true });

router.use(authMiddleware());
router.use(agentMiddleware);

// Create document
router.post("/", validateRequest({
  params: z.object({ agentId: z.string() }),
}), async (req, res) => {
  try {
    const { name } = req.body;
    const result = await KnowledgeBaseService.createDocument({
      name,
      agentId: req.params.agentId,
      organizationId: res.locals.org,
    });

    res.json(result);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// List documents
router.get("/", validateRequest({
  params: z.object({ 
    agentId: z.string() 
  }),
}), async (req, res) => {
  try {
    const result = await KnowledgeBaseService.listDocuments(req.params.agentId);
    res.json(result);
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

// Delete document
router.delete("/:documentId",
  validateRequest({
    params: z.object({ agentId: z.string(), documentId: z.string() }),
  }),
  async (req, res) => {
    try {
      await KnowledgeBaseService.deleteDocument(req.params.documentId, req.params.agentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  }
);

export default router;