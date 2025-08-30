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
        return;
    } catch (error) {
        console.error("Error getting contacts:", error);
        res.status(500).json({ error: "Failed to get contacts" });
        return;
    }
});


router.post(
    "/",
    validateRequest({
        params: z.object({
            agentId: z.string(),
        }),
        body: z.object({
            contactId: z.string().optional(),
            phone: z.string(),
            name: z.string().optional(),
            email: z.string().optional()
        })
    }),
    async (req, res) => {
        try {
            const { phone, name, email, contactId } = req.body;
            if (contactId) {
                const contact = await ContactsService.updateContact(contactId, req.params.agentId, phone, res.locals.org, name, email);
                res.json(contact);
                return;
            } else {
                const contact = await ContactsService.createContact(req.params.agentId, phone, res.locals.org, name, email);
                res.json(contact);
                return;
            }
        } catch (error) {
            console.error("Error creating contact:", error);
            res.status(500).json({ error: "Failed to create contact" });
            return;
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
        return;
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({ error: "Failed to delete contact" });
        return;
    }
});

export default router;