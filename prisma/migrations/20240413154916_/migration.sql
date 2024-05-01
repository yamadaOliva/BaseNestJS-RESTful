/*
  Warnings:

  - You are about to drop the `MessageGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessagePrivate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MessageGroup" DROP CONSTRAINT "MessageGroup_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "MessageGroup" DROP CONSTRAINT "MessageGroup_userId_fkey";

-- DropForeignKey
ALTER TABLE "MessagePrivate" DROP CONSTRAINT "MessagePrivate_fromUserId_fkey";

-- DropForeignKey
ALTER TABLE "MessagePrivate" DROP CONSTRAINT "MessagePrivate_toUserId_fkey";

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "left" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "right" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "MessageGroup";

-- DropTable
DROP TABLE "MessagePrivate";

-- CreateTable
CREATE TABLE "message_groups" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "userId" TEXT NOT NULL,
    "chatroomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_privates" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_privates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "message_groups" ADD CONSTRAINT "message_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_groups" ADD CONSTRAINT "message_groups_chatroomId_fkey" FOREIGN KEY ("chatroomId") REFERENCES "chatrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_privates" ADD CONSTRAINT "message_privates_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_privates" ADD CONSTRAINT "message_privates_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
