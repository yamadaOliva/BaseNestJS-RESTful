-- CreateTable
CREATE TABLE "follows" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "followId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followId_fkey" FOREIGN KEY ("followId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
