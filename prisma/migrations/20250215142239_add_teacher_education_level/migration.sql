/*
  Warnings:

  - Added the required column `education_level` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `teacher` ADD COLUMN `education_level` VARCHAR(100) NULL AFTER `type`;
