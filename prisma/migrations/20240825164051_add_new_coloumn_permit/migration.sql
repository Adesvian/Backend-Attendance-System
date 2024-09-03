/*
  Warnings:

  - Made the column `notes` on table `permit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `permit` MODIFY `notes` LONGTEXT NOT NULL;
