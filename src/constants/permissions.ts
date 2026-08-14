import type { RolUsuario } from "./roles"

// Acciones disponibles por rol
// El ADMINISTRADOR tiene acceso total — se verifica con el flag "todo"

export const PERMISOS: Record<RolUsuario, string[]> = {
  COMPRADOR: [
    "buscar_entradas",
    "ver_detalle_entrada",
    "reservar_entrada",
    "cancelar_reserva",
    "subir_comprobante_pago",
    "confirmar_recepcion",
    "abrir_disputa",
    "subir_evidencia_disputa",
    "solicitar_rol_vendedor",
    "ver_mis_compras",
    "ver_perfil",
    "editar_perfil",
  ],
  VENDEDOR: [
    // Hereda todo lo del comprador
    "buscar_entradas",
    "ver_detalle_entrada",
    "reservar_entrada",
    "cancelar_reserva",
    "subir_comprobante_pago",
    "confirmar_recepcion",
    "abrir_disputa",
    "subir_evidencia_disputa",
    "ver_mis_compras",
    "ver_perfil",
    "editar_perfil",
    // Permisos exclusivos de vendedor
    "publicar_entrada",
    "editar_entrada_borrador",
    "enviar_entrada_revision",
    "aceptar_reserva",
    "rechazar_reserva",
    "subir_evidencia_transferencia",
    "ver_mis_publicaciones",
    "ver_mis_ventas",
  ],
  ADMINISTRADOR: ["todo"],
}

export function tienePermiso(rol: RolUsuario, accion: string): boolean {
  const permisos = PERMISOS[rol]
  return permisos.includes("todo") || permisos.includes(accion)
}
