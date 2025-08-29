import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { ContactsService } from "../services/contacts.service";
import { agentMiddleware } from "../middleware/agent.middleware";
import { validateRequest } from "zod-express-middleware";
import { z } from "zod";

const router = Router({ mergeParams: true });

router.use(authMiddleware());
router.use(agentMiddleware);

router.get("/", validateRequest({
    params: z.object({
        agentId: z.string()
    })
}), async (req, res) => {
    try {
        const contacts = await ContactsService.getContacts(req.params.agentId, res.locals.org);
        res.json(contacts);
    } catch (error) {
        console.error("Error getting contacts:", error);
        res.status(500).json({ error: "Failed to get contacts" });
    }
});


router.post(
    "/:contactId",
    validateRequest({
        params: z.object({
            agentId: z.string(),
            contactId: z.string().optional()
        }),
        body: z.object({
            phone: z.string(),
            name: z.string().optional(),
            email: z.string().optional()
        })
    }),
    async (req, res) => {
        try {
            const { phone, name, email } = req.body;
            if (req.params.contactId) {
                const contact = await ContactsService.updateContact(req.params.contactId, phone, res.locals.org, name, email);
                res.json(contact);
            } else {
                const contact = await ContactsService.createContact(req.params.agentId, phone, res.locals.org, name, email);
                res.json(contact);
            }
        } catch (error) {
            console.error("Error creating contact:", error);
            res.status(500).json({ error: "Failed to create contact" });
        }
    }
)


router.delete("/:contactId", validateRequest({
    params: z.object({
        agentId: z.string(),
        contactId: z.string()
    })
}), async (req, res) => {
    try {
        await ContactsService.deleteContact(req.params.contactId, req.params.agentId, res.locals.org);
        res.json({ message: "Contact deleted successfully" });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ error: "Failed to delete contact" });
    }
});

export default router;