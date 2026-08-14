-- CreateEnum
CREATE TYPE "Ticketera" AS ENUM ('JOINNUS', 'TELETICKET', 'TICKETMASTER');

-- AlterTable
ALTER TABLE "publicaciones" ADD COLUMN     "ticketeraEnum" "Ticketera";
