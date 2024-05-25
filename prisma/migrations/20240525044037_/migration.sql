-- AlterTable
ALTER TABLE "chatroom_users" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'MEMBER',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNREAD';

-- AlterTable
ALTER TABLE "message_privates" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNREAD';
