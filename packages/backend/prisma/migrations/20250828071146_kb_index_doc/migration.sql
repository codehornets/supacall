-- CreateEnum
CREATE TYPE "public"."IndexStatus" AS ENUM ('PENDING', 'INDEXING', 'INDEXED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."AgentKnowledge" ADD COLUMN     "indexStatus" "public"."IndexStatus" NOT NULL DEFAULT 'PENDING';
