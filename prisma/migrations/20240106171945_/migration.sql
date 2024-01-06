-- AddForeignKey
ALTER TABLE "class_count" ADD CONSTRAINT "class_count_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "majors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
