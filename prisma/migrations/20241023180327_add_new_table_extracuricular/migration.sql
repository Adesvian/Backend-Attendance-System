-- CreateTable
CREATE TABLE `EnrollmentExtra` (
    `student_rfid` VARCHAR(100) NOT NULL,
    `ekstrakurikuler` INTEGER NOT NULL,

    UNIQUE INDEX `EnrollmentExtra_student_rfid_ekstrakurikuler_key`(`student_rfid`, `ekstrakurikuler`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EnrollmentExtra` ADD CONSTRAINT `EnrollmentExtra_student_rfid_fkey` FOREIGN KEY (`student_rfid`) REFERENCES `Student`(`rfid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnrollmentExtra` ADD CONSTRAINT `EnrollmentExtra_ekstrakurikuler_fkey` FOREIGN KEY (`ekstrakurikuler`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
