/*
  Warnings:

  - You are about to drop the column `allowPhone` on the `Agent` table. All the data in the column will be lost.
  - You are about to drop the column `allowWebsite` on the `Agent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Agent" DROP COLUMN "allowPhone",
DROP COLUMN "allowWebsite";
