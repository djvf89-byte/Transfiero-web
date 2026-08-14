# Reglas de Negocio — Transfiero v1.0

## Precios y comisiones

### Precio de venta
- **Mínimo:** mayor a S/ 0.00 (no hay precio mínimo relativo al precio original).
- **Máximo:** `precio_original * 1.10` (no puede superar el valor original + 10%).
- El vendedor puede publicar por debajo del precio original si lo desea.

### Comisión comprador
- 7% sobre el precio de venta pactado.
- Se suma al precio que paga el comprador.
- Fórmula: `monto_comprador = precio_venta * 1.07`

### Comisión vendedor
- 3% sobre el precio de venta pactado.
- Se descuenta del monto que recibe el vendedor.
- Fórmula: `monto_vendedor = precio_venta * 0.97`

### Ganancia de Transfiero
- Fórmula: `ganancia = precio_venta * 0.10`

### Ejemplos de cálculo

| Precio original | Precio venta | ¿Válido? | Comprador paga | Vendedor recibe |
|----------------|-------------|----------|----------------|-----------------|
| S/ 300 | S/ 250 | Sí | S/ 267.50 | S/ 242.50 |
| S/ 300 | S/ 300 | Sí | S/ 321.00 | S/ 291.00 |
| S/ 300 | S/ 330 | Sí (máx.) | S/ 353.10 | S/ 320.10 |
| S/ 300 | S/ 350 | **No** — supera +10% | — | — |

---

## Métodos de pago aceptados (V1)

| Método | Notas |
|--------|-------|
| Yape | Sin riesgo de reversión |
| Plin | Sin riesgo de reversión |
| Transferencia bancaria | Verificación manual por admin |
| Tarjeta Visa / Mastercard | Requiere integración con MercadoPago |
| Pago en cuotas | Habilitado vía MercadoPago |

**Pasarela:** MercadoPago (SDK oficial disponible para Next.js). Soporta webhooks para notificación automática de estados de pago.

---

## Roles y estados de usuario

### Roles
- **ADMIN** — acceso total al sistema
- **SELLER** — puede publicar entradas
- **BUYER** — puede reservar y comprar entradas

Un usuario puede tener rol BUYER y SELLER simultáneamente.

### Estados de cuenta de vendedor

```
BUYER               → rol por defecto al registrarse
SELLER_PENDING      → solicitó ser vendedor, en revisión
SELLER              → aprobado como vendedor
SELLER_REJECTED     → solicitud rechazada (puede volver a solicitar)
```

### Proceso para convertirse en SELLER

```
BUYER
→ Solicita ser vendedor desde su perfil
→ Sube DNI (imagen frontal y posterior)
→ Completa datos adicionales de perfil
→ Estado → SELLER_PENDING
→ Admin revisa solicitud y documentos
→ Aprobado: Estado → SELLER
→ Rechazado: Estado → SELLER_REJECTED (con motivo)
```

---

## Estados de una entrada

```
DRAFT              → Publicación en borrador, no visible
PENDING_REVIEW     → Enviada para revisión por admin
APPROVED           → Aprobada, aún no publicada
AVAILABLE          → Visible en marketplace, disponible para reservar
RESERVED           → Reservada por comprador (bloqueada por 15 minutos)
PENDING_SELLER     → Reserva activa, esperando aceptación del vendedor
IN_TRANSFER        → Transferencia oficial en curso
TRANSFERRED        → Vendedor confirmó la transferencia
COMPLETED          → Operación finalizada; fondos liberados
CANCELLED          → Cancelada
DISPUTED           → Disputa activa
```

### Transiciones válidas

```
DRAFT            → PENDING_REVIEW     (vendedor envía a revisión)
PENDING_REVIEW   → APPROVED           (admin aprueba)
PENDING_REVIEW   → CANCELLED          (admin rechaza)
APPROVED         → AVAILABLE          (admin publica)
AVAILABLE        → RESERVED           (comprador reserva — bloqueo 15 min)
AVAILABLE        → CANCELLED          (vendedor cancela — solo si sin reserva activa)
RESERVED         → AVAILABLE          (reserva expiró 15 min sin aceptación o pago)
RESERVED         → PENDING_SELLER     (comprador completa reserva, esperando al vendedor)
PENDING_SELLER   → AVAILABLE          (vendedor rechaza o no responde)
PENDING_SELLER   → IN_TRANSFER        (vendedor acepta + admin confirma pago)
IN_TRANSFER      → TRANSFERRED        (vendedor sube evidencia de transferencia)
IN_TRANSFER      → DISPUTED           (comprador abre disputa)
TRANSFERRED      → COMPLETED          (comprador confirma recepción + admin libera fondos)
TRANSFERRED      → DISPUTED           (comprador rechaza)
DISPUTED         → COMPLETED          (admin resuelve a favor del vendedor)
DISPUTED         → CANCELLED          (admin resuelve a favor del comprador → reembolso)
```

**Regla de bloqueo:** Si existe una reserva activa o una operación en curso (`RESERVED`, `PENDING_SELLER`, `IN_TRANSFER`, `TRANSFERRED`, `DISPUTED`), el vendedor **no puede cancelar** la publicación.

---

## Estados de una operación

```
AWAITING_SELLER    → Reserva creada, esperando aceptación del vendedor
PAYMENT_PENDING    → Vendedor aceptó, esperando pago del comprador
PAYMENT_RECEIVED   → Admin confirmó recepción del pago
SELLER_NOTIFIED    → Admin notificó al vendedor para iniciar transferencia
TRANSFER_IN_PROGRESS → Vendedor inició proceso de transferencia
BUYER_CONFIRMED    → Comprador confirmó recepción de la entrada
FUNDS_RELEASED     → Admin liberó los fondos al vendedor
REFUNDED           → Fondos devueltos al comprador
DISPUTED           → Disputa abierta; fondos en espera
CANCELLED          → Operación cancelada
```

### Transiciones válidas

```
AWAITING_SELLER      → PAYMENT_PENDING       (vendedor acepta la reserva)
AWAITING_SELLER      → CANCELLED             (vendedor rechaza / reserva expira 15 min)
PAYMENT_PENDING      → PAYMENT_RECEIVED      (admin confirma pago)
PAYMENT_PENDING      → CANCELLED             (comprador cancela antes de pagar)
PAYMENT_RECEIVED     → SELLER_NOTIFIED       (admin notifica al vendedor)
SELLER_NOTIFIED      → TRANSFER_IN_PROGRESS  (vendedor sube evidencia de transferencia)
SELLER_NOTIFIED      → REFUNDED              (vendedor no sube evidencia en 48h → reembolso)
TRANSFER_IN_PROGRESS → BUYER_CONFIRMED       (comprador confirma recepción)
TRANSFER_IN_PROGRESS → DISPUTED              (comprador abre disputa)
BUYER_CONFIRMED      → FUNDS_RELEASED        (admin libera fondos)
DISPUTED             → FUNDS_RELEASED        (admin resuelve a favor del vendedor)
DISPUTED             → REFUNDED              (admin resuelve a favor del comprador)
FUNDS_RELEASED       → [estado final]
REFUNDED             → [estado final]
CANCELLED            → [estado final]
```

---

## Reservas

- Una entrada solo puede tener una reserva activa a la vez.
- La reserva expira en **15 minutos** si el vendedor no acepta.
- Al expirar, la entrada vuelve a `AVAILABLE`.
- **No hay cron job en V1.** La expiración se ejecuta manualmente por el admin o se verifica en el momento en que alguien intenta acceder a la reserva (lazy expiration).
- Un usuario no puede reservar su propia publicación.

---

## Comportamiento del vendedor al recibir una reserva

- El vendedor recibe notificación de reserva.
- Tiene **15 minutos** para aceptar o rechazar.
- Si acepta: operación avanza a `PAYMENT_PENDING`, comprador ve instrucciones de pago.
- Si rechaza o no responde: reserva expira, entrada vuelve a `AVAILABLE`.
- Si la operación llega a `SELLER_NOTIFIED` y el vendedor no sube evidencia en **48 horas**:
  - Operación pasa a `REFUNDED`.
  - Reembolso total al comprador.
  - Penalidad registrada en historial del vendedor.
  - Admin gestiona la penalidad manualmente.

---

## Confirmación del comprador (V1)

- No hay auto-confirmación automática en V1.
- Si el comprador no responde tras `TRANSFERRED`, la operación pasa a revisión administrativa.
- El admin puede forzar la liberación de fondos si determina que la transferencia fue exitosa.

---

## Disputas

- Solo el comprador puede abrir una disputa.
- Solo disponible en estados `TRANSFER_IN_PROGRESS` o `TRANSFERRED`.
- El admin tiene la decisión final.
- Resoluciones:
  - A favor del vendedor → `FUNDS_RELEASED`, entrada `COMPLETED`.
  - A favor del comprador → `REFUNDED`, entrada `CANCELLED`.

---

## Restricciones generales

- El vendedor **no puede cancelar** una publicación con reserva activa u operación en curso.
- El vendedor **no puede modificar** precio ni datos clave una vez en estado `AVAILABLE` o posterior.
- El sistema no procesa pagos automáticamente en V1 (excepto pasarela de tarjetas).
- No hay integraciones con ticketeras en V1; toda validación de entrada es manual.
- No hay liberación automática de fondos en V1.
