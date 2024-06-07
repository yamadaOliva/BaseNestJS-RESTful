/*
  Warnings:

  - Added the required column `OwnerId` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "OwnerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_OwnerId_fkey" FOREIGN KEY ("OwnerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
