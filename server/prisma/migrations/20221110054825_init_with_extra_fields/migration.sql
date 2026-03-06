-- CreateTable
CREATE TABLE `virtual_aliases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `domain_id` INTEGER NOT NULL,
    `source` VARCHAR(200) NOT NULL,
    `destination` VARCHAR(1000) NOT NULL,

    INDEX `domain_id`(`domain_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_domains` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `active` TINYINT NOT NULL DEFAULT 1,

    UNIQUE INDEX `virtual_domains_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `virtual_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `domain_id` INTEGER NOT NULL,
    `email` VARCHAR(200) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `quota` INTEGER NOT NULL DEFAULT 1000,
    `active` TINYINT NOT NULL DEFAULT 1,
    `password` VARCHAR(106) NOT NULL,
    `bytes` BIGINT NOT NULL DEFAULT 0,
    `messages` INTEGER NOT NULL DEFAULT 0,
    `last_login` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `virtual_users_email_key`(`email`),
    INDEX `domain_id`(`domain_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `virtual_aliases` ADD CONSTRAINT `virtual_aliases_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `virtual_domains`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `virtual_users` ADD CONSTRAINT `virtual_users_ibfk_1` FOREIGN KEY (`domain_id`) REFERENCES `virtual_domains`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
