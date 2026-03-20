-- AlterTable
ALTER TABLE `virtual_users` MODIFY `domain_id` INTEGER NULL,
    MODIFY `name` VARCHAR(100) NOT NULL DEFAULT '',
    MODIFY `password` VARCHAR(106) NOT NULL DEFAULT '';
