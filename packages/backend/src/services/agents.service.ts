import { prisma } from "../lib/db";
import { Agent, AgentTwilio } from "@prisma/client";

export interface CreateAgentData {
  name: string;
  description: string;
  allowWebsite?: boolean;
  allowPhone?: boolean;
  organizationId: string;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  allowWebsite?: boolean;
  allowPhone?: boolean;
}

export interface TwilioSettings {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export class AgentsService {
    // Agent CRUD Operations
    static async getAllAgents(organizationId: string): Promise<Agent[]> {
        return await prisma.agent.findMany({
            where: { organizationId },
            orderBy: { createdAt: "desc" },
        });
    }

    static async createAgent(data: CreateAgentData): Promise<Agent> {
        return await prisma.agent.create({
            data,
        });
    }

    static async getAgentById(id: string, organizationId: string): Promise<Agent | null> {
        return await prisma.agent.findFirst({
            where: {
                id,
                organizationId,
            },
        });
    }

    static async updateAgent(id: string, data: UpdateAgentData): Promise<Agent> {
        return await prisma.agent.update({
            where: { id },
            data,
        });
    }

    static async deleteAgent(id: string): Promise<void> {
        await prisma.agent.delete({
            where: { id },
        });
    }

    // Twilio Operations
    static async getTwilioSettings(agentId: string): Promise<AgentTwilio | null> {
        return await prisma.agentTwilio.findFirst({
            where: { agentId },
        });
    }

    static async upsertTwilioSettings(agentId: string, organizationId: string, data: TwilioSettings): Promise<AgentTwilio> {
        return await prisma.agentTwilio.upsert({
            where: { agentId },
            update: data,
            create: {
                ...data,
                agentId,
                organizationId,
            },
        });
    }
}