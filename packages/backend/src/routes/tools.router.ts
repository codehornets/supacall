import { Router } from "express"
import { validateRequest } from "zod-express-middleware"
import { authMiddleware } from "../middleware/auth.middleware"
import { agentMiddleware } from "../middleware/agent.middleware"
import z from "zod"
import { ToolsService } from "../services/tools.service"

const router = Router({ mergeParams: true })

router.use(authMiddleware())
router.use(agentMiddleware)

router.get("/", validateRequest({
    params: z.object({
        agentId: z.string()
    })
}), async (req, res) => {
    try {
        const { agentId } = req.params;
        const tools = await ToolsService.getTools(agentId, res.locals.org);
        res.status(200).json(tools);
        return
    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        return
    }
})


router.post("/mcp", validateRequest({
    params: z.object({
        agentId: z.string()
    }),
    body: z.object({
        endpoint: z.string(),
        authToken: z.string().optional()
    }),
}), async (req, res) => {
    try {
        const { agentId } = req.params;
        const { endpoint, authToken } = req.body;
        await ToolsService.addMcp(agentId, res.locals.org, endpoint, authToken || null);
        res.status(200).json({ message: "MCP added" })
        return
    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        return
    }
})

router.delete("/mcp/:endpoint", validateRequest({
    params: z.object({
        agentId: z.string(),
        endpoint: z.string()
    }),
}), async (req, res) => {
    try {
        const { agentId, endpoint } = req.params;
        await ToolsService.deleteMcp(agentId, res.locals.org, endpoint);
        res.status(200).json({ message: "MCP deleted" })
        return
    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        return
    }
})

router.post("/cal", validateRequest({
    params: z.object({
        agentId: z.string()
    }),
    body: z.object({
        apiKey: z.string()
    }),
}), async (req, res) => {
    try {
        const { agentId } = req.params;
        const { apiKey } = req.body;
        await ToolsService.upsertCal(agentId, res.locals.org, apiKey);
        res.status(200).json({ message: "Cal API key updated" })
        return

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        return
    }
})


router.post("/oauth-complete", validateRequest({
    params: z.object({
        agentId: z.string()
    }),
    body: z.object({
        code: z.string(),
        provider: z.enum(["calendly"])
    }),
}), async (req, res) => {
    try {
        const { agentId } = req.params;
        const { code, provider } = req.body;

        if (provider === "calendly") {
            await ToolsService.upsertCalendly(agentId, res.locals.org, code);
        }

        res.status(200).json({ message: "OAuth complete" })
        return

    } catch (error) {
        res.status(500).json({ error: "Internal server error" })
        return
    }
})

export default router;