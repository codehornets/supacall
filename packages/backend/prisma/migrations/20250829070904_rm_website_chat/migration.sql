/*
  Warnings:

  - You are about to drop the column `modality` on the `Conversation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AgentTools" ADD COLUMN     "calendly" JSONB;

-- AlterTable
ALTER TABLE "public"."Conversation" DROP COLUMN "modality";

-- DropEnum
DROP TYPE "public"."ConversationModality";

-- CreateTable
CREATE TABLE "public"."AgentTwilio" (
    "agentId" TEXT NOT NULL,
    "accountSid" TEXT NOT NULL,
    "authToken" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentTwilio_pkey" PRIMARY KEY ("agentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentTwilio_agentId_key" ON "public"."AgentTwilio"("agentId");

-- AddForeignKey
ALTER TABLE "public"."AgentTwilio" ADD CONSTRAINT "AgentTwilio_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
