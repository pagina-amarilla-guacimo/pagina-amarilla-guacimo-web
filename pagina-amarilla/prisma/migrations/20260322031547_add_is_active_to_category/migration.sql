/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
