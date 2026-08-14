# PRD — Transfiero v1.0

## Resumen ejecutivo

Transfiero es una plataforma peruana que actúa como intermediario de confianza en la transferencia de entradas entre particulares. Resuelve el problema de las estafas en canales informales (WhatsApp, Facebook, Telegram) mediante un modelo de custodia temporal de fondos (escrow manual).

## Problema

La reventa informal de entradas en Perú ocurre mayormente en canales sin protección:

- Facebook Marketplace / grupos
- WhatsApp y Telegram
- Instagram DMs

Consecuencias:
- Entradas falsas o duplicadas
- Compradores que no pagan
- Vendedores que desaparecen tras recibir el dinero
- Sin mecanismo de disputa ni recuperación de fondos

## Solución

Intermediación con escrow manual supervisado por administradores:

1. El vendedor publica su entrada en la plataforma.
2. El comprador reserva y realiza el pago a Transfiero.
3. Transfiero retiene los fondos.
4. El vendedor transfiere la entrada oficialmente (vía la ticketera correspondiente).
5. El comprador confirma la recepción.
6. Transfiero libera los fondos al vendedor menos comisión.

## Alcance V1

### Incluido

| Módulo | Descripción |
|--------|-------------|
| Autenticación | Registro, login, recuperación de contraseña (NextAuth) |
| Roles | ADMIN, SELLER, BUYER |
| Publicación de entradas | Formulario con datos del evento, precio, evidencia |
| Marketplace | Listado público con filtros por categoría, evento, precio |
| Reservas | Bloqueo de entrada por comprador interesado |
| Gestión de pagos | Manual: admin marca pago recibido |
| Gestión de transferencias | Manual: admin marca transferencia completada |
| Confirmación de comprador | Comprador confirma recepción de entrada |
| Liberación de fondos | Manual: admin libera fondos al vendedor |
| Disputas | Apertura de disputa por comprador; resolución por admin |
| Dashboard administrativo | Vista completa de usuarios, entradas, operaciones, disputas |

### Excluido en V1

- Integración con Ticketmaster, Teleticket, Joinnus
- OCR para validación de entradas
- IA / ML
- Liberación automática de fondos
- Pagos internacionales
- App móvil nativa

## Mercado objetivo

- **País:** Perú
- **Categorías:** Conciertos, Deportes, Festivales, Teatro
- **Ticketeras de referencia (sin integración):** Ticketmaster Perú, Teleticket, Joinnus

## Modelo de negocio

| Parte | Comisión |
|-------|----------|
| Comprador | +7% sobre precio de venta |
| Vendedor | -3% sobre precio de venta |

**Precio de venta:** mayor a S/ 0.00 y menor o igual a `precio_original * 1.10`. Puede ser menor al precio original.

### Ejemplo

```
Precio original:    S/ 300.00
Precio de venta:    S/ 330.00  (máximo permitido, +10%)
Comprador paga:     S/ 353.10  (330 × 1.07)
Vendedor recibe:    S/ 320.10  (330 × 0.97)
Transfiero retiene: S/  33.00
```

## Métodos de pago aceptados (V1)

| Método | Tipo |
|--------|------|
| Yape | Wallet digital |
| Plin | Wallet digital |
| Transferencia bancaria | Banca tradicional |
| Tarjeta Visa / Mastercard | Pasarela MercadoPago |
| Pago en cuotas | Vía pasarela de tarjeta |

## Roles y permisos

### ADMIN
- Gestión completa de usuarios
- Aprobar / rechazar publicaciones de entradas
- Marcar pagos como recibidos
- Notificar a vendedores para iniciar transferencia
- Marcar transferencias como completadas
- Liberar fondos al vendedor
- Resolver disputas
- Ver reportes y métricas

### SELLER
- Registrarse y completar perfil
- Publicar entradas (quedan en revisión hasta aprobación)
- Ver estado de sus publicaciones
- Subir evidencia de transferencia
- Ver historial de ventas y pagos recibidos

### BUYER
- Registrarse y completar perfil
- Buscar y filtrar entradas disponibles
- Reservar una entrada
- Registrar pago (subir comprobante)
- Confirmar recepción de entrada
- Abrir disputa si hay problema
- Ver historial de compras

## Métricas de éxito V1

- Tiempo de ciclo promedio de una operación (publicación → fondos liberados)
- Tasa de operaciones completadas vs. disputadas
- Tasa de conversión reserva → pago completado
- Número de operaciones por semana

## Flujo de compra aprobado (D9)

```
RESERVAR → VENDEDOR ACEPTA → COMPRADOR PAGA → VENDEDOR TRANSFIERE → COMPRADOR CONFIRMA → ADMIN LIBERA FONDOS
```

No se permite el flujo directo COMPRAR → PAGAR sin aceptación previa del vendedor.

## Supuestos y decisiones de diseño

- Reserva expira en **15 minutos** sin respuesta del vendedor. Sin cron job en V1; expiración lazy o manual por admin.
- No hay auto-confirmación del comprador en V1. Admin interviene si el comprador no responde.
- El vendedor tiene **48 horas** para subir evidencia de transferencia. Si no lo hace: reembolso total + penalidad.
- Un usuario nace como BUYER. Para vender debe solicitar rol SELLER (requiere DNI + aprobación del admin).
- El vendedor no puede cancelar una publicación con reserva activa u operación en curso.
- Los pagos con Yape/Plin/transferencia se verifican manualmente por el admin.
- Los pagos con tarjeta se procesan vía **MercadoPago** — requiere integración de SDK y webhooks.
- El comprobante de pago (Yape/Plin/transferencia) es una imagen subida por el comprador.
- La evidencia de transferencia de entrada es imagen o PDF subido por el vendedor.
