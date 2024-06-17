-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_postId_fkey";

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
