import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from 'zod-express-middleware';
import { agentMiddleware } from '../middleware/agent.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { AgentsService } from '../services/agents.service';

const router = Router({ mergeParams: true });

const twilioSchema = z.object({
  accountSid: z.string(),
  authToken: z.string(),
  phoneNumber: z.string(),
});

router.use(authMiddleware());
router.use(agentMiddleware);

// Get Twilio settings for an agent
router.get('/', validateRequest({
  params: z.object({ agentId: z.string() }),
}), async (req, res) => {
  try {
    const { agentId } = req.params;

    const twilioSettings = await AgentsService.getTwilioSettings(agentId);

    if (!twilioSettings) {
      return res.status(200).json(null);
    }

    return res.json(twilioSettings);
  } catch (error) {
    console.error('Error fetching Twilio settings:', error);
    return res.status(500).json({ error: 'Failed to fetch Twilio settings' });
  }
});

// Update or create Twilio settings for an agent
router.post('/', validateRequest({
  params: z.object({ agentId: z.string() }),
  body: twilioSchema,
}), async (req, res) => {
  try {
    const { agentId } = req.params;
    const data = twilioSchema.parse(req.body);

    const twilioSettings = await AgentsService.upsertTwilioSettings(agentId, res.locals.org, data);

    return res.json(twilioSettings);
  } catch (error) {
    console.log(error);
    console.error('Error updating Twilio settings:', error);
    return res.status(500).json({ error: 'Failed to update Twilio settings' });
  }
});

export default router;
