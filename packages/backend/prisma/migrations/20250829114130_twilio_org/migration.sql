/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `AgentTwilio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `AgentTwilio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AgentTwilio" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AgentTwilio_phoneNumber_key" ON "public"."AgentTwilio"("phoneNumber");

-- AddForeignKey
ALTER TABLE "public"."AgentTwilio" ADD CONSTRAINT "AgentTwilio_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
