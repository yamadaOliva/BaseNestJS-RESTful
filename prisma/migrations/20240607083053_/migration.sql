/*
  Warnings:

  - You are about to drop the column `statusOnline` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "statusOnline",
ALTER COLUMN "statusAccount" SET DEFAULT 'INACTIVE';

-- CreateTable
CREATE TABLE "active_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "active_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "active_codes_userId_key" ON "active_codes"("userId");

-- AddForeignKey
ALTER TABLE "active_codes" ADD CONSTRAINT "active_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
