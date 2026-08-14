-- CreateEnum
CREATE TYPE "TipoReembolso" AS ENUM ('TOTAL', 'PARCIAL_COMISION');

-- CreateEnum
CREATE TYPE "MotivoReembolso" AS ENUM ('FRAUDE_VENDEDOR', 'TICKET_INVALIDO', 'INCUMPLIMIENTO_VENDEDOR', 'ERROR_TRANSFIERO', 'DISPUTA_RESUELTA_COMPRADOR', 'ARREPENTIMIENTO_COMPRADOR', 'CANCELACION_SOLICITADA_COMPRADOR', 'COMPRADOR_NO_RESPONDE', 'CASO_EXTRAORDINARIO');

-- AlterEnum
ALTER TYPE "EstadoOperacion" ADD VALUE 'PENDIENTE_CONFIRMACION_COMPRADOR';

-- AlterTable
ALTER TABLE "operaciones" ADD COLUMN     "avisoVencimientoEnviadoEn" TIMESTAMP(3),
ADD COLUMN     "comisionPaseraCentimos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fechaInicioConfirmacion" TIMESTAMP(3),
ADD COLUMN     "fechaLiberacionAutomatica" TIMESTAMP(3),
ADD COLUMN     "fechaLimiteConfirmacion" TIMESTAMP(3),
ADD COLUMN     "fechaTransferenciaValidada" TIMESTAMP(3),
ADD COLUMN     "motivoLiberacion" TEXT;

-- CreateTable
CREATE TABLE "reembolsos" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "tipo" "TipoReembolso" NOT NULL,
    "motivo" "MotivoReembolso" NOT NULL,
    "motivoDetalle" TEXT,
    "montoDevueltoCompradorCentimos" INTEGER NOT NULL,
    "comisionRetenidaCentimos" INTEGER NOT NULL DEFAULT 0,
    "comisionPaseraCentimos" INTEGER NOT NULL DEFAULT 0,
    "procesadoPorId" TEXT NOT NULL,
    "procesadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reembolsos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reembolsos_operacionId_key" ON "reembolsos"("operacionId");

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reembolsos" ADD CONSTRAINT "reembolsos_procesadoPorId_fkey" FOREIGN KEY ("procesadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
