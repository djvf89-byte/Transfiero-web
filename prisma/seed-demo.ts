import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  // ── Vendedor de prueba ─────────────────────────────────────────────────────
  const vendedor = await prisma.usuario.upsert({
    where: { email: "demo.vendedor@transfiero.pe" },
    update: {},
    create: {
      email: "demo.vendedor@transfiero.pe",
      nombre: "Marco Rodríguez",
      rolPrincipal: "VENDEDOR",
      estadoVendedor: "APROBADO",
      estadoCuenta: "ACTIVO",
    },
  })

  // ── Publicaciones de prueba ────────────────────────────────────────────────
  const publicaciones = [
    // CONCIERTOS
    {
      nombreEvento: "Bad Bunny — Most Wanted Tour",
      lugarEvento: "Estadio Nacional, Lima",
      fechaEvento: new Date("2026-08-15T20:00:00"),
      categoria: "CONCIERTO" as const,
      precioOriginalCentimos: 45000,
      precioVentaCentimos: 49000,
      descripcion: "Entrada para la tribuna norte, fila 12, asiento 22. Precio original S/ 450.",
    },
    {
      nombreEvento: "Coldplay — Music of the Spheres World Tour",
      lugarEvento: "Estadio Nacional, Lima",
      fechaEvento: new Date("2026-09-20T20:30:00"),
      categoria: "CONCIERTO" as const,
      precioOriginalCentimos: 38000,
      precioVentaCentimos: 41500,
      descripcion: "Sector campo A. Vista perfecta al escenario principal.",
    },
    {
      nombreEvento: "Karol G — Mañana Será Bonito Tour",
      lugarEvento: "Jockey Club del Perú, Lima",
      fechaEvento: new Date("2026-10-05T21:00:00"),
      categoria: "CONCIERTO" as const,
      precioOriginalCentimos: 28000,
      precioVentaCentimos: 30500,
      descripcion: "Platea VIP con vista frontal al escenario.",
    },

    // DEPORTES
    {
      nombreEvento: "Alianza Lima vs. Universitario — Clásico del Fútbol Peruano",
      lugarEvento: "Estadio Alejandro Villanueva, Lima",
      fechaEvento: new Date("2026-07-27T15:00:00"),
      categoria: "DEPORTE" as const,
      precioOriginalCentimos: 12000,
      precioVentaCentimos: 13000,
      descripcion: "Tribuna sur, entrada adulto. El partido más importante de la temporada.",
    },
    {
      nombreEvento: "Selección Peruana vs. Argentina — Eliminatorias 2026",
      lugarEvento: "Estadio Nacional, Lima",
      fechaEvento: new Date("2026-09-09T20:00:00"),
      categoria: "DEPORTE" as const,
      precioOriginalCentimos: 20000,
      precioVentaCentimos: 22000,
      descripcion: "Occidente norte, fila 8. Única en este precio.",
    },
    {
      nombreEvento: "Liga Nacional de Vóley — Final Temporada 2026",
      lugarEvento: "Coliseo Eduardo Dibós, Lima",
      fechaEvento: new Date("2026-08-30T17:00:00"),
      categoria: "DEPORTE" as const,
      precioOriginalCentimos: 6000,
      precioVentaCentimos: 6500,
      descripcion: "Preferencial lateral. Gran partido para el cierre de temporada.",
    },

    // FESTIVALES
    {
      nombreEvento: "Vivo x el Rock 2026",
      lugarEvento: "La Molina Racecourse, Lima",
      fechaEvento: new Date("2026-08-23T12:00:00"),
      categoria: "FESTIVAL" as const,
      precioOriginalCentimos: 15000,
      precioVentaCentimos: 16000,
      descripcion: "Entrada general de 2 días. Bandas internacionales y nacionales.",
    },
    {
      nombreEvento: "Reggaeton Lima Festival",
      lugarEvento: "Costa Verde, Miraflores",
      fechaEvento: new Date("2026-11-01T16:00:00"),
      categoria: "FESTIVAL" as const,
      precioOriginalCentimos: 18000,
      precioVentaCentimos: 19500,
      descripcion: "Zona preferencial. J Balvin, Maluma y más artistas.",
    },
    {
      nombreEvento: "Lima Jazz Festival 2026",
      lugarEvento: "Anfiteatro del Parque de la Exposición",
      fechaEvento: new Date("2026-10-18T19:00:00"),
      categoria: "FESTIVAL" as const,
      precioOriginalCentimos: 9000,
      precioVentaCentimos: 9700,
      descripcion: "Acceso general para los 3 días del festival.",
    },

    // TEATRO
    {
      nombreEvento: "Hamilton — El Musical (Gira Latinoamérica)",
      lugarEvento: "Gran Teatro Nacional, Lima",
      fechaEvento: new Date("2026-09-12T20:00:00"),
      categoria: "TEATRO" as const,
      precioOriginalCentimos: 25000,
      precioVentaCentimos: 27000,
      descripcion: "Platea fila 5, asiento central. Función especial de estreno.",
    },
    {
      nombreEvento: "El Rey León — Producción Broadway",
      lugarEvento: "Teatro Peruano Japonés, Lima",
      fechaEvento: new Date("2026-10-25T19:30:00"),
      categoria: "TEATRO" as const,
      precioOriginalCentimos: 18000,
      precioVentaCentimos: 19500,
      descripcion: "Balcón preferencial. Función de sábado con elenco completo.",
    },
    {
      nombreEvento: "Los Monólogos de la Vagina — Edición 20 Aniversario",
      lugarEvento: "Teatro Canout, Lima",
      fechaEvento: new Date("2026-08-08T20:00:00"),
      categoria: "TEATRO" as const,
      precioOriginalCentimos: 8000,
      precioVentaCentimos: 8500,
      descripcion: "Fila central, butaca numerada.",
    },

    // OTROS
    {
      nombreEvento: "TEDxLima 2026 — El Futuro que Construimos",
      lugarEvento: "UTEC, Barranco",
      fechaEvento: new Date("2026-09-27T09:00:00"),
      categoria: "OTRO" as const,
      precioOriginalCentimos: 35000,
      precioVentaCentimos: 38000,
      descripcion: "Entrada completa de día para los 12 speakers. Incluye almuerzo.",
    },
    {
      nombreEvento: "Cirque du Soleil — KOOZA Lima",
      lugarEvento: "Campo de Marte, Jesús María",
      fechaEvento: new Date("2026-11-15T20:00:00"),
      categoria: "OTRO" as const,
      precioOriginalCentimos: 22000,
      precioVentaCentimos: 24000,
      descripcion: "Zona VIP lateral, carpa principal. Espectáculo de 2h.",
    },
    {
      nombreEvento: "World Padel Tour — Lima Open 2026",
      lugarEvento: "Club Lima Polo & Hunt",
      fechaEvento: new Date("2026-08-02T10:00:00"),
      categoria: "OTRO" as const,
      precioOriginalCentimos: 5000,
      precioVentaCentimos: 5400,
      descripcion: "Acceso a todas las canchas durante el torneo.",
    },
  ]

  let creadas = 0
  for (const pub of publicaciones) {
    await prisma.publicacion.create({
      data: {
        vendedorId: vendedor.id,
        nombreEvento: pub.nombreEvento,
        lugarEvento: pub.lugarEvento,
        fechaEvento: pub.fechaEvento,
        categoria: pub.categoria,
        precioOriginalCentimos: pub.precioOriginalCentimos,
        precioVentaCentimos: pub.precioVentaCentimos,
        descripcion: pub.descripcion,
        estado: "DISPONIBLE",
      },
    })
    creadas++
  }

  console.log(`✓ Vendedor demo creado: ${vendedor.email}`)
  console.log(`✓ ${creadas} publicaciones de prueba creadas`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
