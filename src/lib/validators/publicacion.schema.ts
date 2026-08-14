import { z } from "zod"

const categorias = ["CONCIERTO", "DEPORTE", "FESTIVAL", "TEATRO", "OTRO"] as const

export const publicacionBaseSchema = z.object({
  nombreEvento: z.string().min(3, "Mínimo 3 caracteres").max(150, "Máximo 150 caracteres"),
  fechaEvento: z
    .string()
    .min(1, "La fecha del evento es requerida")
    .refine((val) => new Date(val) > new Date(), {
      message: "La fecha del evento debe ser futura",
    }),
  lugarEvento: z.string().min(3, "Mínimo 3 caracteres").max(200, "Máximo 200 caracteres"),
  categoria: z.enum(categorias, { error: "Categoría inválida" }),
  descripcion: z.string().max(500, "Máximo 500 caracteres").optional(),
  precioOriginalSoles: z.coerce
    .number({ error: "Ingresa el precio original" })
    .positive("Debe ser mayor a 0"),
  precioVentaSoles: z.coerce
    .number({ error: "Ingresa el precio de venta" })
    .positive("Debe ser mayor a 0"),
  zona: z.string().max(100).optional(),
  asiento: z.string().max(50).optional(),
  ticketeraEnum: z.enum(["JOINNUS", "TELETICKET", "TICKETMASTER"], {
    error: "Debes seleccionar la ticketera de la entrada",
  }),
  artista: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string().max(150, "Máximo 150 caracteres").optional()
  ),
  spotifyEmbedUrl: z.preprocess(
    (v) => (v === "" ? undefined : v),
    z.string()
      .regex(
        /^https:\/\/open\.spotify\.com\/embed\//,
        "Solo se aceptan URLs de Spotify Embed (https://open.spotify.com/embed/...)"
      )
      .optional()
  ),
})

export const crearPublicacionSchema = publicacionBaseSchema.refine(
  (data) => data.precioVentaSoles <= data.precioOriginalSoles * 1.1,
  {
    message: "El precio de venta no puede superar el 110% del precio original",
    path: ["precioVentaSoles"],
  }
)

export const editarPublicacionSchema = publicacionBaseSchema.refine(
  (data) => data.precioVentaSoles <= data.precioOriginalSoles * 1.1,
  {
    message: "El precio de venta no puede superar el 110% del precio original",
    path: ["precioVentaSoles"],
  }
)

export const rechazarPublicacionSchema = z.object({
  motivoRechazo: z.string().min(10, "El motivo debe tener al menos 10 caracteres").max(500),
})

export type CrearPublicacionInput = z.infer<typeof crearPublicacionSchema>
export type EditarPublicacionInput = z.infer<typeof editarPublicacionSchema>
export type RechazarPublicacionInput = z.infer<typeof rechazarPublicacionSchema>
