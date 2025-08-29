import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { validateRequest } from 'zod-express-middleware';

const router = Router();

const twilioSchema = z.object({
  accountSid: z.string(),
  authToken: z.string(),
  phoneNumber: z.string(),
});

// Get Twilio settings for an agent
router.get('/:agentId', validateRequest({
  params: z.object({ agentId: z.string() }),
}), async (req, res) => {
  try {
    const { agentId } = req.params;

    const twilioSettings = await prisma.agentTwilio.findFirst({
      where: { agentId },
    });

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
router.post('/:agentId', validateRequest({
  params: z.object({ agentId: z.string() }),
  body: twilioSchema,
}), async (req, res) => {
  try {
    const { agentId } = req.params;
    const data = twilioSchema.parse(req.body);

    const twilioSettings = await prisma.agentTwilio.upsert({
      where: { agentId },
      update: data,
      create: {
        ...data,
        agentId,
      },
    });

    return res.json(twilioSettings);
  } catch (error) {
    console.log(error);
    console.error('Error updating Twilio settings:', error);
    return res.status(500).json({ error: 'Failed to update Twilio settings' });
  }
});

export default router;
