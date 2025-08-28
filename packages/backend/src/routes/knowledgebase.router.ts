import { Router } from "express";
import { KnowledgeBaseService } from "../services/knowledgebase.service";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware());

// Create document
router.post("/:agentId", async (req, res) => {
  try {
    const { name, data, mimeType, size } = req.body;
    const result = await KnowledgeBaseService.createDocument({
      name,
      data,
      agentId: req.params.agentId,
      mimeType,
      size
    });

    res.json(result);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// List documents
router.get("/:agentId", async (req, res) => {
  try {
    const result = await KnowledgeBaseService.listDocuments(req.params.agentId);
    res.json(result);
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ error: "Failed to list documents" });
  }
});

// Delete document
router.delete("/:agentId/:id", async (req, res) => {
  try {
    await KnowledgeBaseService.deleteDocument(req.params.id, req.params.agentId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;