-- AlterEnum
ALTER TYPE "EstadoOperacion" ADD VALUE 'ESPERANDO_VENDEDOR';

-- AlterEnum
ALTER TYPE "EstadoPublicacion" ADD VALUE 'PENDIENTE_VENDEDOR';

-- AlterTable
ALTER TABLE "operaciones" ALTER COLUMN "estado" SET DEFAULT 'ESPERANDO_VENDEDOR';

-- AlterTable
ALTER TABLE "publicaciones" ADD COLUMN     "imagenPortadaCloudinaryId" TEXT,
ADD COLUMN     "imagenPortadaUrl" TEXT;
