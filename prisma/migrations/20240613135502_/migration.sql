/*
  Warnings:

  - You are about to drop the column `status` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "status";
