/*
  Warnings:

  - Added the required column `afterStock` to the `InventoryLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `beforeStock` to the `InventoryLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InventoryLog" ADD COLUMN     "afterStock" INTEGER NOT NULL,
ADD COLUMN     "beforeStock" INTEGER NOT NULL;
