# Transfiero — CLAUDE.md

## Qué es este proyecto

Transfiero es una plataforma peruana de intermediación para la transferencia segura de entradas entre usuarios. Actúa como escrow manual: retiene fondos del comprador mientras el vendedor realiza la transferencia oficial de la entrada, y los libera solo tras confirmación del comprador.

**No es una ticketera. No vende entradas. No emite tickets. No organiza eventos.**

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, Shadcn UI |
| Backend | Next.js fullstack (API Routes / Server Actions) |
| Base de datos | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Storage | Cloudinary |
| Deploy | Vercel |

## Reglas para Claude

### Antes de escribir cualquier código

1. Analiza la idea o cambio propuesto.
2. Detecta riesgos técnicos y operativos.
3. Propón arquitectura o enfoque.
4. Espera aprobación explícita del usuario antes de implementar.

### Durante el desarrollo

- No asumir reglas de negocio no definidas en `docs/business-rules.md`.
- Toda lógica de negocio debe pasar por servicios (`/src/services`), no directamente en rutas o componentes.
- Los estados de entrada y operación son los definidos en `docs/business-rules.md`. No inventar nuevos.
- El precio máximo de reventa es `precio_original * 1.10`. Nunca permitir mayor.
- Las comisiones son: comprador 7%, vendedor 3%.
- En V1 toda validación es manual. No implementar automatizaciones no aprobadas.
- No integrar Ticketmaster, Teleticket ni Joinnus en V1.

### Lo que NO hacer en V1

- OCR
- IA / ML
- Liberación automática de fondos
- Integraciones con ticketeras
- Automatizaciones complejas

### Convenciones de código

- TypeScript estricto (`strict: true`).
- Componentes en PascalCase, utilidades en camelCase.
- Rutas de API en `/src/app/api/`.
- Esquemas de validación con Zod.
- No usar `any`. No suprimir errores de TypeScript sin comentario explicativo.

## Documentación del proyecto

- `docs/prd.md` — Product Requirements Document
- `docs/business-rules.md` — Reglas de negocio y estados
- `docs/risk-matrix.md` — Matriz de riesgos
- `docs/user-flows.md` — Flujos de usuario por rol
