import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { ConversationsService } from "../services/conversations.service";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

const router = Router({ mergeParams: true });

router.use(authMiddleware());

router.get(
    "/",
    validateRequest({
        params: z.object({
            agentId: z.string()
        })
    }),
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