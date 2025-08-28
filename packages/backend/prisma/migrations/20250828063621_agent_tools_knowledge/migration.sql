-- DropIndex
DROP INDEX "public"."Conversation_organizationId_idx";

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "humanTakeoverAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."AgentTools" (
    "cal" JSONB,
    "mcp" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agentId" TEXT NOT NULL,

    CONSTRAINT "AgentTools_pkey" PRIMARY KEY ("agentId")
);

-- CreateTable
CREATE TABLE "public"."AgentKnowledge" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentTools_agentId_key" ON "public"."AgentTools"("agentId");

-- AddForeignKey
ALTER TABLE "public"."AgentTools" ADD CONSTRAINT "AgentTools_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AgentKnowledge" ADD CONSTRAINT "AgentKnowledge_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
