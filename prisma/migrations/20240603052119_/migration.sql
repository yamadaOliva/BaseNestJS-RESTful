/*
  Warnings:

  - You are about to drop the column `left` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the column `right` on the `comments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "comments" DROP COLUMN "left",
DROP COLUMN "right",
ADD COLUMN     "fatherId" TEXT DEFAULT '';
