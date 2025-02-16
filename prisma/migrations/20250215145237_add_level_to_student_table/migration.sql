/*
  Warnings:

  - Added the required column `level` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `level` VARCHAR(100) NOT NULL AFTER `name`;

