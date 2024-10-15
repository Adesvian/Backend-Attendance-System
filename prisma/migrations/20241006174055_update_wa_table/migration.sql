/*
  Warnings:

  - The primary key for the `wasession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `wasession` table. All the data in the column will be lost.
  - Added the required column `greet_template` to the `WaSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `WaSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `TimeThreshold` ADD COLUMN `custom_time` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `WaSession` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `greet_template` LONGTEXT NOT NULL,
    ADD COLUMN `number` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`number`);

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
