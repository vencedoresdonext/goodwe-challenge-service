-- AlterTable
ALTER TABLE `chargers` ADD COLUMN `receiverCardId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `chargers` ADD CONSTRAINT `chargers_receiverCardId_fkey` FOREIGN KEY (`receiverCardId`) REFERENCES `customer_cards`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
