-- AlterTable
ALTER TABLE `charger_sessions` ADD COLUMN `idleStartedAt` DATETIME(3) NULL,
    ADD COLUMN `lastBatteryPercentage` INTEGER NULL;

-- AlterTable
ALTER TABLE `stations` ADD COLUMN `contractedDemandKw` DOUBLE NOT NULL DEFAULT 100.0,
    ADD COLUMN `currentConsumptionKw` DOUBLE NOT NULL DEFAULT 0.0,
    ADD COLUMN `currentSolarGenerationKw` DOUBLE NOT NULL DEFAULT 0.0;
