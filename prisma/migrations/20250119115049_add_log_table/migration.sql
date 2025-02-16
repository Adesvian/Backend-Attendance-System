-- CreateTable
CREATE TABLE `Log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user` VARCHAR(255) NOT NULL,
    `activity` LONGTEXT NOT NULL,
    `date_time` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
