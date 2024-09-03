-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `rfid` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `class` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(100) NOT NULL,
    `parent_nid` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`rfid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parent` (
    `nid` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phone_num` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`nid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Teacher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nid` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Teacher_nid_key`(`nid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subject` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Subject_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Class` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Class_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassSchedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class_id` INTEGER NOT NULL,
    `subject_id` INTEGER NOT NULL,
    `teacher_id` INTEGER NOT NULL,
    `day` VARCHAR(100) NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,

    UNIQUE INDEX `ClassSchedule_class_id_subject_id_teacher_id_day_key`(`class_id`, `subject_id`, `teacher_id`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WaSession` (
    `session_name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`session_name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `kelas` VARCHAR(100) NOT NULL,
    `reason` VARCHAR(100) NOT NULL,
    `attachment` VARCHAR(100) NOT NULL,
    `date` INTEGER NOT NULL,
    `status` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AttendanceRecord` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_rfid` VARCHAR(100) NOT NULL,
    `student_name` VARCHAR(100) NOT NULL,
    `class` VARCHAR(100) NOT NULL,
    `date` INTEGER NOT NULL,
    `method` INTEGER NOT NULL,
    `status` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubjectAttendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `student_rfid` VARCHAR(100) NOT NULL,
    `student_name` VARCHAR(100) NOT NULL,
    `class` VARCHAR(100) NOT NULL,
    `date` INTEGER NOT NULL,
    `subject` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TimeThreshold` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `class` VARCHAR(100) NOT NULL,
    `method` INTEGER NOT NULL,
    `time` TIME NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_parent_nid_fkey` FOREIGN KEY (`parent_nid`) REFERENCES `Parent`(`nid`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSchedule` ADD CONSTRAINT `ClassSchedule_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `Class`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSchedule` ADD CONSTRAINT `ClassSchedule_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `Subject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassSchedule` ADD CONSTRAINT `ClassSchedule_teacher_id_fkey` FOREIGN KEY (`teacher_id`) REFERENCES `Teacher`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `Permit` RENAME COLUMN `kelas` TO `class`;

ALTER TABLE `Permit`
ADD COLUMN `notes` LONGTEXT NULL AFTER `date`;

