/*
  Warnings:

  - You are about to drop the column `Hashedpassword` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[password]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_Hashedpassword_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "Hashedpassword",
ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");
