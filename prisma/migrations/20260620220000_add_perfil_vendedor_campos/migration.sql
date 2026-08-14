-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "nombres" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "apellidos" TEXT;
ALTER TABLE "usuarios" ADD COLUMN "dni" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_dni_key" ON "usuarios"("dni");
