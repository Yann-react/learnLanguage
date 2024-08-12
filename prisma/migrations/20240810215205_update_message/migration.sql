/*
  Warnings:

  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `contentSystem` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contentUser` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
ADD COLUMN     "contentSystem" TEXT NOT NULL,
ADD COLUMN     "contentUser" TEXT NOT NULL;
