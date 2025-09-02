import { prisma } from "../lib/db";

export class ToolsService {
    static async getTools(agentId: string, organizationId: string) {
        const tools = await prisma.agentTools.findFirst({
            where: { agentId: agentId, organizationId },
        })
        return tools;
    }

    static async addMcp(agentId: string, organizationId: string, endpoint: string, authToken: string | null) {
        let tool = await this.getTools(agentId, organizationId);

        if (!tool) {
            tool = await prisma.agentTools.create({
                data: { agentId, organizationId }
            })
        }

        let mcp: Array<{ endpoint: string, authToken: string }> = Array.from((tool.mcp as any) || []);

        if (mcp.find((mcp) => mcp.endpoint === endpoint)) {
            throw new Error("MCP already exists");
        }

        mcp.push({ endpoint, authToken: authToken || "" });

        await prisma.agentTools.update({
            where: {
                agentId: agentId,
                organizationId
            },
            data: { 
                mcp: mcp
            }
        })
    }

    static async deleteMcp(agentId: string, organizationId: string, endpoint: string) {
        let tool = await this.getTools(agentId, organizationId);
        if(!tool) {
            throw new Error("Tool not found");
        }
        let mcp: Array<{ endpoint: string, authToken: string }> = Array.from((tool.mcp as any) || []);
        mcp = mcp.filter((mcp) => mcp.endpoint !== endpoint);
        await prisma.agentTools.update({
            where: { agentId: agentId, organizationId },
            data: { mcp: mcp }
        })
    }

    static async upsertCal(agentId: string, organizationId: string, apiKey: string) {
        let tool = await this.getTools(agentId, organizationId);
    
        if (!tool) {
            tool = await prisma.agentTools.create({
                data: { agentId, organizationId }
            })
        }

        await prisma.agentTools.update({
            where: { agentId: agentId, organizationId },
            data: { cal: apiKey }
        })
    }

    static async upsertCalendly(agentId: string, organizationId: string, code: string) {
        let tool = await this.getTools(agentId, organizationId);
    
        if (!tool) {
            tool = await prisma.agentTools.create({
                data: { agentId, organizationId }
            })
        }
    
        // Complete oauth calendly


    }

}
