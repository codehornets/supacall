import { indexingQueue } from "../lib/queue";
import { prisma } from "../lib/db";

interface CreateDocumentParams {
  name: string;
  data: string;
  agentId: string;
  mimeType: string;
  size: number;
}

export class KnowledgeBaseService {
  static async createDocument(params: CreateDocumentParams) {
    try {
      // Create database record
      // Generate AWS file name
      const fileName = `${params.agentId}/${Date.now()}-${params.name}`;

      const document = await prisma.agentKnowledge.create({
        data: {
          file: fileName,
          data: params.data,
          agentId: params.agentId,
          indexStatus: "PENDING",
        },
      });

      // Queue for indexing
      await indexingQueue.add(
        `index-${document.id}`,
        {
          documentId: document.id,
          file: document.file,
          agentId: params.agentId,
        },
        {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );

      return document;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }

  static async listDocuments(agentId: string, page = 1, limit = 10) {
    try {
      const [documents, total] = await Promise.all([
        prisma.agentKnowledge.findMany({
          where: { agentId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
          include: {
            agent: true,
          },
        }),
        prisma.agentKnowledge.count({
          where: { agentId },
        }),
      ]);

      return {
        documents,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error listing documents:", error);
      throw error;
    }
  }

  static async deleteDocument(id: string, agentId: string) {
    try {
      const document = await prisma.agentKnowledge.findFirst({
        where: { id, agentId },
      });

      if (!document) {
        throw new Error("Document not found");
      }

      // Delete database record
      await prisma.agentKnowledge.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }
}
