/*
  Warnings:

  - You are about to drop the column `data` on the `AgentKnowledge` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `AgentKnowledge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AgentKnowledge" DROP COLUMN "data",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."AgentKnowledgeIndex" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentKnowledgeId" TEXT NOT NULL,
    "referenceImage" TEXT NOT NULL,
    "referenceText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentKnowledgeIndex_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."AgentKnowledge" ADD CONSTRAINT "AgentKnowledge_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentKnowledgeIndex" ADD CONSTRAINT "AgentKnowledgeIndex_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentKnowledgeIndex" ADD CONSTRAINT "AgentKnowledgeIndex_agentKnowledgeId_fkey" FOREIGN KEY ("agentKnowledgeId") REFERENCES "public"."AgentKnowledge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
