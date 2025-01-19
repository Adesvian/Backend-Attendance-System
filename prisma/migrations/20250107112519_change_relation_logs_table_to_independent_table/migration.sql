/*
  Warnings:

  - You are about to drop the column `userId` on the `log` table. All the data in the column will be lost.
  - Added the required column `user` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `log` DROP FOREIGN KEY `Log_userId_fkey`;

-- AlterTable
ALTER TABLE `log` DROP COLUMN `userId`,
    ADD COLUMN `user` VARCHAR(255) NOT NULL;
