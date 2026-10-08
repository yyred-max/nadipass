/*
  Warnings:

  - You are about to drop the column `profileHash` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BreakGlassLog" ADD COLUMN     "officerInstansi" TEXT,
ADD COLUMN     "officerName" TEXT;

-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "profileHash",
ADD COLUMN     "birthYear" INTEGER,
ADD COLUMN     "fullName" TEXT;
