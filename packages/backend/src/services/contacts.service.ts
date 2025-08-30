import { prisma } from "../lib/db";

export class ContactsService {
    static async getContacts(agentId: string, organizationId: string) {
        const contacts = await prisma.contact.findMany({
            where: { agentId, organizationId }
        });
        return contacts;
    }


    static async createContact(agentId: string, phone: string, organizationId: string, name?: string, email?: string) {
        const contact = await prisma.contact.create({
            data: { agentId, name, email, phone, organizationId }
        });
        return contact;
    }

    static async updateContact(contactId: string, agentId: string, phone: string, organizationId: string, name?: string, email?: string) {
        const contact = await prisma.contact.update({
            where: { id: contactId, organizationId, agentId },
            data: { name, email, phone, organizationId, agentId }
        });
        return contact;
    }

    static async deleteContact(contactId: string, agentId: string, organizationId: string) {
        await prisma.contact.delete({
            where: { id: contactId, agentId, organizationId }
        });
    }

    static async getContactByPhone(phone: string, agentId: string, organizationId: string) {
        const contact = await prisma.contact.findFirst({
            where: { phone, agentId, organizationId }
        });
        return contact;
    }

}
