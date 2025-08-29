import { indexingQueue } from "../lib/queue";
import { prisma } from "../lib/db";

interface CreateDocumentParams {
  name: string;
  agentId: string;
}

export class KnowledgeBaseService {
  static async createDocument(params: CreateDocumentParams) {
    try {
      const document = await prisma.agentKnowledge.create({
        data: {
          file: params.name,
          data: "",
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

  static async listDocuments(agentId: string) {
    try {
      const documents = await prisma.agentKnowledge.findMany({
        where: { agentId },
      });

      return documents;
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
