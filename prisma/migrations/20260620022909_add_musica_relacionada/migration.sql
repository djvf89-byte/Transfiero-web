-- CreateEnum
CREATE TYPE "TipoInteresConcierto" AS ENUM ('VISUALIZACION', 'RESERVA');

-- AlterTable
ALTER TABLE "publicaciones" ADD COLUMN     "artista" TEXT,
ADD COLUMN     "spotifyEmbedUrl" TEXT;

-- CreateTable
CREATE TABLE "interes_concierto" (
    "id" TEXT NOT NULL,
    "publicacionId" TEXT NOT NULL,
    "usuarioId" TEXT,
    "tipo" "TipoInteresConcierto" NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interes_concierto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interes_concierto_publicacionId_tipo_idx" ON "interes_concierto"("publicacionId", "tipo");

-- CreateIndex
CREATE INDEX "interes_concierto_usuarioId_idx" ON "interes_concierto"("usuarioId");

-- AddForeignKey
ALTER TABLE "interes_concierto" ADD CONSTRAINT "interes_concierto_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
