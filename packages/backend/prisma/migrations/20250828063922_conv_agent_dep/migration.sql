/*
  Warnings:

  - Added the required column `agentId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agentId` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Contact" ADD COLUMN     "agentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Conversation" ADD COLUMN     "agentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Conversation" ADD CONSTRAINT "Conversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "public"."Agent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
