/*
  Warnings:

  - You are about to drop the column `artista` on the `publicaciones` table. All the data in the column will be lost.
  - You are about to drop the column `spotifyEmbedUrl` on the `publicaciones` table. All the data in the column will be lost.
  - You are about to drop the `interes_concierto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "interes_concierto" DROP CONSTRAINT "interes_concierto_publicacionId_fkey";

-- AlterTable
ALTER TABLE "publicaciones" DROP COLUMN "artista",
DROP COLUMN "spotifyEmbedUrl";

-- DropTable
DROP TABLE "interes_concierto";

-- DropEnum
DROP TYPE "TipoInteresConcierto";
