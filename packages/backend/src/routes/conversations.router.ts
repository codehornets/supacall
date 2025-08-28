import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { ConversationsService } from "../services/conversations.service";

const router = Router();

router.use(authMiddleware());

router.get(
    "/:agentId",
    async (req, res) => {
        try {
            const { agentId } = req.params;
            const conversations = await ConversationsService.getConversations(agentId);
            res.json(conversations);
        } catch (error) {
            console.error("Error getting conversations:", error);
            res.status(500).json({ error: "Failed to get conversations" });
        }
    }
)

export default router;