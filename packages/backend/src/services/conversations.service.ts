import { prisma } from "../lib/db";
import { ContactsService } from "./contacts.service";

export class ConversationsService {
    static async getConversations(agentId: string) {
        const conversations = await prisma.conversation.findMany({
            where: { agentId }
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
        const messages = JSON.parse(conversation.messages as string);

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
                messages: JSON.stringify(messages)
            }
        });

        return updatedConversation;
    }

}
