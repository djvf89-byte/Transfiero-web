import type { RolUsuario, EstadoVendedor, EstadoCuenta } from "@prisma/client"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      rolPrincipal: RolUsuario
      estadoVendedor: EstadoVendedor
      estadoCuenta: EstadoCuenta
    } & DefaultSession["user"]
  }

  interface User {
    rolPrincipal: RolUsuario
    estadoVendedor: EstadoVendedor
    estadoCuenta: EstadoCuenta
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    rolPrincipal: RolUsuario
    estadoVendedor: EstadoVendedor
    estadoCuenta: EstadoCuenta
  }
}
