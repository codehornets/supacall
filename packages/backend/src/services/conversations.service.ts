import { prisma } from "../lib/db";

export class ConversationsService {
    static async getConversations(agentId: string) {
        const conversations = await prisma.conversation.findMany({
            where: { agentId }
        });
        return conversations;
    }
}
