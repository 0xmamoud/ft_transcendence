/*
  Warnings:

  - A unique constraint covering the columns `[userId,tokenHash]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Session_userId_tokenHash_key" ON "Session"("userId", "tokenHash");
