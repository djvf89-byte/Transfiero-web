-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('COMPRADOR', 'VENDEDOR', 'ADMINISTRADOR');

-- CreateEnum
CREATE TYPE "EstadoVendedor" AS ENUM ('NO_SOLICITADO', 'PENDIENTE', 'APROBADO', 'RECHAZADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoCuenta" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'BANEADO');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "CategoriaEvento" AS ENUM ('CONCIERTO', 'DEPORTE', 'FESTIVAL', 'TEATRO', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoPublicacion" AS ENUM ('BORRADOR', 'PENDIENTE_REVISION', 'APROBADA', 'DISPONIBLE', 'RESERVADA', 'EN_TRANSFERENCIA', 'TRANSFERIDA', 'COMPLETADA', 'CANCELADA', 'EN_DISPUTA');

-- CreateEnum
CREATE TYPE "EstadoOperacion" AS ENUM ('PAGO_PENDIENTE', 'PAGO_RECIBIDO', 'VENDEDOR_NOTIFICADO', 'TRANSFERENCIA_EN_PROCESO', 'COMPRADOR_CONFIRMADO', 'FONDOS_LIBERADOS', 'REEMBOLSADA', 'EN_DISPUTA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('YAPE', 'PLIN', 'TRANSFERENCIA_BANCARIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'RECIBIDO', 'RECHAZADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "TipoEvidencia" AS ENUM ('DNI_FRONTAL', 'DNI_POSTERIOR', 'COMPRA_ENTRADA', 'TICKET', 'TRANSFERENCIA', 'PAGO', 'DISPUTA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoDisputa" AS ENUM ('ABIERTA', 'EN_REVISION', 'RESUELTA_VENDEDOR', 'RESUELTA_COMPRADOR');

-- CreateEnum
CREATE TYPE "EstadoRetiro" AS ENUM ('PENDIENTE', 'PROCESADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoCuenta" AS ENUM ('AHORROS', 'CORRIENTE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "name" TEXT NOT NULL,
    "telefono" TEXT,
    "image" TEXT,
    "rolPrincipal" "RolUsuario" NOT NULL DEFAULT 'COMPRADOR',
    "estadoVendedor" "EstadoVendedor" NOT NULL DEFAULT 'NO_SOLICITADO',
    "estadoCuenta" "EstadoCuenta" NOT NULL DEFAULT 'ACTIVO',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "solicitudes_vendedor" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "revisadoPorId" TEXT,
    "revisadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_vendedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_bancarias" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "tipoCuenta" "TipoCuenta" NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "cci" TEXT,
    "titular" TEXT NOT NULL,
    "documentoTitular" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "cuentas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publicaciones" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "nombreEvento" TEXT NOT NULL,
    "fechaEvento" TIMESTAMP(3) NOT NULL,
    "lugarEvento" TEXT NOT NULL,
    "categoria" "CategoriaEvento" NOT NULL,
    "descripcion" TEXT,
    "precioOriginalCentimos" INTEGER NOT NULL,
    "precioVentaCentimos" INTEGER NOT NULL,
    "zona" TEXT,
    "asiento" TEXT,
    "ticketera" TEXT,
    "estado" "EstadoPublicacion" NOT NULL DEFAULT 'BORRADOR',
    "aprobadoPorId" TEXT,
    "aprobadoEn" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "publicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operaciones" (
    "id" TEXT NOT NULL,
    "publicacionId" TEXT NOT NULL,
    "compradorId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "estado" "EstadoOperacion" NOT NULL DEFAULT 'PAGO_PENDIENTE',
    "precioVentaCentimos" INTEGER NOT NULL,
    "comisionCompradorCentimos" INTEGER NOT NULL,
    "comisionVendedorCentimos" INTEGER NOT NULL,
    "montoCompradorCentimos" INTEGER NOT NULL,
    "montoVendedorCentimos" INTEGER NOT NULL,
    "reservadaEn" TIMESTAMP(3) NOT NULL,
    "reservaExpiraEn" TIMESTAMP(3) NOT NULL,
    "vendedorAceptoEn" TIMESTAMP(3),
    "liberadoPorId" TEXT,
    "fechaLiberacion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,
    "eliminadoEn" TIMESTAMP(3),

    CONSTRAINT "operaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "pagadorId" TEXT NOT NULL,
    "tipo" "TipoPago" NOT NULL,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "montoCentimos" INTEGER NOT NULL,
    "referenciaExterna" TEXT,
    "pasarelaId" TEXT,
    "confirmadoPorId" TEXT,
    "confirmadoEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEvidencia" NOT NULL,
    "url" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "publicacionId" TEXT,
    "operacionId" TEXT,
    "disputaId" TEXT,
    "solicitudVendedorId" TEXT,
    "subidoPorId" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputas" (
    "id" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "abridaPorId" TEXT NOT NULL,
    "estado" "EstadoDisputa" NOT NULL DEFAULT 'ABIERTA',
    "motivo" TEXT NOT NULL,
    "resueltosPorId" TEXT,
    "resolucionNota" TEXT,
    "resueltaEn" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios_disputa" (
    "id" TEXT NOT NULL,
    "disputaId" TEXT NOT NULL,
    "autorId" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_disputa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retiros" (
    "id" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "operacionId" TEXT NOT NULL,
    "cuentaBancariaId" TEXT NOT NULL,
    "montoCentimos" INTEGER NOT NULL,
    "estado" "EstadoRetiro" NOT NULL DEFAULT 'PENDIENTE',
    "procesadoPorId" TEXT,
    "procesadoEn" TIMESTAMP(3),
    "notaAdmin" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT,
    "actorId" TEXT,
    "ip" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_estadoCuenta_idx" ON "usuarios"("estadoCuenta");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "solicitudes_vendedor_usuarioId_estado_idx" ON "solicitudes_vendedor"("usuarioId", "estado");

-- CreateIndex
CREATE INDEX "cuentas_bancarias_usuarioId_activo_idx" ON "cuentas_bancarias"("usuarioId", "activo");

-- CreateIndex
CREATE INDEX "cuentas_bancarias_eliminadoEn_idx" ON "cuentas_bancarias"("eliminadoEn");

-- CreateIndex
CREATE INDEX "publicaciones_estado_fechaEvento_idx" ON "publicaciones"("estado", "fechaEvento");

-- CreateIndex
CREATE INDEX "publicaciones_vendedorId_estado_idx" ON "publicaciones"("vendedorId", "estado");

-- CreateIndex
CREATE INDEX "publicaciones_eliminadoEn_idx" ON "publicaciones"("eliminadoEn");

-- CreateIndex
CREATE INDEX "operaciones_publicacionId_estado_idx" ON "operaciones"("publicacionId", "estado");

-- CreateIndex
CREATE INDEX "operaciones_compradorId_estado_idx" ON "operaciones"("compradorId", "estado");

-- CreateIndex
CREATE INDEX "operaciones_vendedorId_estado_idx" ON "operaciones"("vendedorId", "estado");

-- CreateIndex
CREATE INDEX "operaciones_reservaExpiraEn_estado_idx" ON "operaciones"("reservaExpiraEn", "estado");

-- CreateIndex
CREATE INDEX "operaciones_eliminadoEn_idx" ON "operaciones"("eliminadoEn");

-- CreateIndex
CREATE INDEX "pagos_operacionId_idx" ON "pagos"("operacionId");

-- CreateIndex
CREATE INDEX "pagos_referenciaExterna_idx" ON "pagos"("referenciaExterna");

-- CreateIndex
CREATE INDEX "evidencias_publicacionId_idx" ON "evidencias"("publicacionId");

-- CreateIndex
CREATE INDEX "evidencias_operacionId_idx" ON "evidencias"("operacionId");

-- CreateIndex
CREATE INDEX "evidencias_disputaId_idx" ON "evidencias"("disputaId");

-- CreateIndex
CREATE INDEX "evidencias_solicitudVendedorId_idx" ON "evidencias"("solicitudVendedorId");

-- CreateIndex
CREATE UNIQUE INDEX "disputas_operacionId_key" ON "disputas"("operacionId");

-- CreateIndex
CREATE INDEX "disputas_estado_idx" ON "disputas"("estado");

-- CreateIndex
CREATE INDEX "comentarios_disputa_disputaId_idx" ON "comentarios_disputa"("disputaId");

-- CreateIndex
CREATE UNIQUE INDEX "retiros_operacionId_key" ON "retiros"("operacionId");

-- CreateIndex
CREATE INDEX "retiros_vendedorId_estado_idx" ON "retiros"("vendedorId", "estado");

-- CreateIndex
CREATE INDEX "notificaciones_usuarioId_leida_idx" ON "notificaciones"("usuarioId", "leida");

-- CreateIndex
CREATE INDEX "auditorias_entidad_entidadId_idx" ON "auditorias"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "auditorias_actorId_idx" ON "auditorias"("actorId");

-- CreateIndex
CREATE INDEX "auditorias_creadoEn_idx" ON "auditorias"("creadoEn");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_vendedor" ADD CONSTRAINT "solicitudes_vendedor_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_vendedor" ADD CONSTRAINT "solicitudes_vendedor_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_bancarias" ADD CONSTRAINT "cuentas_bancarias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publicaciones" ADD CONSTRAINT "publicaciones_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_compradorId_fkey" FOREIGN KEY ("compradorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_liberadoPorId_fkey" FOREIGN KEY ("liberadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_pagadorId_fkey" FOREIGN KEY ("pagadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_confirmadoPorId_fkey" FOREIGN KEY ("confirmadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_publicacionId_fkey" FOREIGN KEY ("publicacionId") REFERENCES "publicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_disputaId_fkey" FOREIGN KEY ("disputaId") REFERENCES "disputas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_solicitudVendedorId_fkey" FOREIGN KEY ("solicitudVendedorId") REFERENCES "solicitudes_vendedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_abridaPorId_fkey" FOREIGN KEY ("abridaPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_resueltosPorId_fkey" FOREIGN KEY ("resueltosPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_disputa" ADD CONSTRAINT "comentarios_disputa_disputaId_fkey" FOREIGN KEY ("disputaId") REFERENCES "disputas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_disputa" ADD CONSTRAINT "comentarios_disputa_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros" ADD CONSTRAINT "retiros_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros" ADD CONSTRAINT "retiros_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros" ADD CONSTRAINT "retiros_cuentaBancariaId_fkey" FOREIGN KEY ("cuentaBancariaId") REFERENCES "cuentas_bancarias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiros" ADD CONSTRAINT "retiros_procesadoPorId_fkey" FOREIGN KEY ("procesadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
