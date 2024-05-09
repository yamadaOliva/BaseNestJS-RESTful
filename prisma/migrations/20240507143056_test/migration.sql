/*
  Warnings:

  - You are about to drop the column `comeFrom` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "comeFrom",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "district" TEXT,
ALTER COLUMN "liveIn" DROP NOT NULL,
ALTER COLUMN "liveIn" SET DEFAULT 'Ha Noi',
ALTER COLUMN "Birthday" DROP NOT NULL;
