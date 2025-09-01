import Redis from "ioredis";
import { REDIS_URL } from "../lib/constants";
import { prisma } from "../lib/db";
import { ContactsService } from "./contacts.service";

export class ConversationsService {
    static async getConversations(agentId: string) {
        const conversations = await prisma.conversation.findMany({
            where: { agentId },
            include: {
                contact: true
            }
        });
        return conversations;
    }

    static async createConversation(agentId: string, phone: string, organizationId: string) {
        let contact = await ContactsService.getContactByPhone(phone, agentId, organizationId)

        if(!contact) {
            contact = await ContactsService.createContact(agentId, phone, organizationId)
        }

        const conversation = await prisma.conversation.create({
            data: {
                agentId,
                contactId: contact.id,
                organizationId
            }
        })

        return conversation
    }

    static async syncConversation(conversationId: string, history: { role: string, content: string }) {
        // Get the current conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });

        if (!conversation) {
            throw new Error('Conversation not found');
        }

        // Parse existing messages
        const messages = Array.isArray(conversation.messages) ? conversation.messages : [];

        // Add new message
        messages.push({
            role: history.role,
            content: history.content,
            timestamp: new Date().toISOString()
        });

        // Update conversation with new messages
        const updatedConversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                messages: messages
            }
        });

        return updatedConversation;
    }

    static async sendHumanFeedback(conversationId: string, feedback: string) {

        const redis = new Redis(REDIS_URL);

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        });
        
        if(!conversation) {
            throw new Error('Conversation not found');
        }

        const messages = JSON.parse(conversation.messages as string);

        messages.push({
            type: "human_feedback",
            content: feedback,
            timestamp: new Date().toISOString()
        });

        const updatedConversation = await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                messages: JSON.stringify(messages)
            }
        });

        const conversationRedis = await redis.get(`conversation:${conversationId}`);

        if(conversationRedis) {
            const conversationRedisData = JSON.parse(conversationRedis);
            conversationRedisData.push({
                type: "human_feedback",
                content: feedback,
                timestamp: new Date().toISOString()
            });
            await redis.set(`conversation:${conversationId}`, JSON.stringify(conversationRedisData));
            redis.disconnect();
        }

        return updatedConversation;
    }

}
