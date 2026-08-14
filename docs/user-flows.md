# Flujos de Usuario — Transfiero v1.0

## Convenciones

- **[AUTO]** = acción del sistema sin intervención humana
- **[ADMIN]** = acción realizada por un administrador
- **[SELLER]** = acción realizada por el vendedor
- **[BUYER]** = acción realizada por el comprador
- `Entrada →` = transición de estado de la entrada
- `Operación →` = transición de estado de la operación

---

## Flujo 1: Registro de usuario

```
Usuario accede a /registro
→ Completa formulario (nombre, email, contraseña, teléfono)
→ [AUTO] Cuenta creada con rol BUYER
→ [AUTO] Email de verificación enviado
→ Usuario verifica email
→ Accede al dashboard como BUYER
```

---

## Flujo 2: Solicitud para ser SELLER

```
[BUYER] Accede a su perfil → "Quiero vender entradas"
→ [BUYER] Sube foto de DNI (frontal y posterior)
→ [BUYER] Completa datos de perfil (nombre completo, teléfono verificado)
→ [AUTO] Estado → SELLER_PENDING
→ [ADMIN] Recibe solicitud en dashboard

[ADMIN] Revisa solicitud y documentos
→ Aprueba: Estado → SELLER · [BUYER] notificado "Ya puedes publicar entradas"
→ Rechaza (con motivo): Estado → SELLER_REJECTED · [BUYER] notificado con motivo
```

---

## Flujo 3: Publicación de entrada (SELLER)

```
[SELLER] Accede a "Publicar entrada"
→ Completa formulario:
    - Nombre del evento, fecha, lugar
    - Categoría (Concierto / Deporte / Festival / Teatro)
    - Ticketera (Ticketmaster / Teleticket / Joinnus / Otra)
    - Zona / Sector
    - Precio original + evidencia (imagen recomendada)
    - Precio de venta (0 < precio_venta ≤ precio_original × 1.10)
    - [AUTO] Validación de precio en servidor
→ [SELLER] Envía a revisión
→ Entrada → PENDING_REVIEW
→ [AUTO] Admin notificado

[ADMIN] Revisa publicación
→ Aprueba → Entrada: APPROVED → AVAILABLE · [SELLER] notificado
→ Rechaza (con motivo) → Entrada: CANCELLED · [SELLER] notificado con motivo
```

**Regla:** El vendedor no puede cancelar ni modificar una publicación con reserva activa u operación en curso.

---

## Flujo 4: Compra de una entrada — flujo principal (D9)

```
FASE 1 — Reserva
─────────────────
[BUYER] Navega marketplace → selecciona entrada AVAILABLE
→ Ve detalle: evento, zona, precio de venta, total a pagar (precio × 1.07)
→ [BUYER] Hace clic en "Reservar"
→ [AUTO] Verifica que entrada sigue AVAILABLE (lock atómico)
→ Entrada → RESERVED
→ Operación → AWAITING_SELLER (creada)
→ [SELLER] Notificado: "Tienes una reserva. Acepta o rechaza en 15 min."

FASE 2 — Aceptación del vendedor
──────────────────────────────────
[SELLER] Revisa reserva
→ Acepta:
    → Operación → PAYMENT_PENDING
    → Entrada → PENDING_SELLER
    → [BUYER] Notificado: "El vendedor aceptó. Realiza el pago."
    → [BUYER] Ve instrucciones de pago (Yape / Plin / Transferencia / Tarjeta)
→ Rechaza:
    → Operación → CANCELLED
    → Entrada → AVAILABLE
    → [BUYER] Notificado: "El vendedor rechazó la reserva."

→ Si no responde en 15 min:
    → Reserva expira (verificación lazy o manual por admin)
    → Operación → CANCELLED
    → Entrada → AVAILABLE
    → [BUYER] Notificado: "La reserva expiró."

FASE 3 — Pago del comprador
─────────────────────────────
[BUYER] Realiza pago fuera de la plataforma (o con tarjeta vía pasarela)
→ [BUYER] Sube comprobante de pago (imagen / referencia de pasarela)

[ADMIN] Verifica comprobante
→ Pago válido:
    → Operación → PAYMENT_RECEIVED
    → [ADMIN] Notifica al vendedor para iniciar transferencia
    → Operación → SELLER_NOTIFIED
→ Pago inválido:
    → [ADMIN] Solicita nuevo comprobante al comprador
    → Si no hay solución: Operación → CANCELLED · Entrada → AVAILABLE

FASE 4 — Transferencia del vendedor
──────────────────────────────────────
[SELLER] Recibe notificación para transferir
→ Tiene 48 horas para subir evidencia
→ [SELLER] Realiza transferencia oficial vía ticketera
→ [SELLER] Sube evidencia (screenshot / email de confirmación)
→ Operación → TRANSFER_IN_PROGRESS
→ Entrada → IN_TRANSFER

[ADMIN] Revisa evidencia
→ Válida:
    → Entrada → TRANSFERRED
    → [BUYER] Notificado: "Tu entrada fue transferida. Confírmala."
→ Inválida o no recibida en 48h:
    → Operación → REFUNDED · Entrada → CANCELLED
    → Reembolso total al comprador
    → Penalidad registrada al vendedor
    → [BUYER] y [SELLER] notificados

FASE 5 — Confirmación y liberación
────────────────────────────────────
[BUYER] Verifica acceso a la entrada
→ Confirma recepción:
    → Operación → BUYER_CONFIRMED
    → [ADMIN] Procede a liberar fondos
    → Operación → FUNDS_RELEASED · Entrada → COMPLETED
    → [SELLER] Notificado: "Fondos liberados."
→ No responde (admin interviene):
    → [ADMIN] Revisa caso manualmente
    → Puede forzar liberación si transferencia es verificable
→ Abre disputa → ver Flujo 6
```

---

## Flujo 5: Cancelación de reserva

### Por el comprador (en PAYMENT_PENDING, antes de pagar)

```
[BUYER] Cancela reserva activa
→ Operación → CANCELLED · Entrada → AVAILABLE
```

### Por expiración (15 minutos sin aceptación del vendedor)

```
[AUTO / ADMIN] Reserva lleva más de 15 min sin respuesta del vendedor
→ Operación → CANCELLED · Entrada → AVAILABLE
→ [BUYER] Notificado: "La reserva expiró."
```

*Nota V1: La expiración se verifica de forma lazy (al intentar acceder a la reserva) o manualmente por el admin. No hay cron job en V1.*

### Por el admin

```
[ADMIN] Cancela operación activa con justificación
→ Si fondos recibidos: Operación → REFUNDED
→ Si fondos no recibidos: Operación → CANCELLED
→ Entrada → AVAILABLE o CANCELLED según criterio del admin
```

---

## Flujo 6: Disputa

```
[BUYER] Tiene operación en TRANSFER_IN_PROGRESS o TRANSFERRED
→ [BUYER] Abre disputa con descripción
→ Operación → DISPUTED · Entrada → DISPUTED
→ [ADMIN] Notificado

[ADMIN] Investiga
→ Puede solicitar evidencia adicional a BUYER y/o SELLER
→ BUYER y SELLER pueden subir evidencias

[ADMIN] Resuelve
→ A favor del vendedor:
    → Operación → FUNDS_RELEASED · Entrada → COMPLETED
→ A favor del comprador:
    → Operación → REFUNDED · Entrada → CANCELLED
    → Reembolso total al comprador
```

---

## Flujo 7: Dashboard del administrador

```
[ADMIN] Cola de trabajo (ordenada por urgencia):
    1. SELLER_PENDING       → aprobar/rechazar solicitudes de vendedor
    2. PENDING_REVIEW       → revisar publicaciones de entradas
    3. AWAITING_SELLER      → reservas sin respuesta del vendedor (>10 min)
    4. PAYMENT_PENDING      → verificar comprobantes de pago
    5. SELLER_NOTIFIED      → vigilar plazo 48h para evidencia
    6. TRANSFER_IN_PROGRESS → verificar evidencias de transferencia
    7. BUYER_CONFIRMED      → liberar fondos al vendedor
    8. DISPUTED             → resolver disputas activas

[ADMIN] Vista de métricas:
    - Operaciones activas por estado
    - Monto total en custodia
    - Operaciones completadas hoy
    - Disputas abiertas
    - Vendedores con penalidades

[ADMIN] Gestión de usuarios:
    - Ver y buscar usuarios
    - Cambiar roles
    - Suspender / reactivar cuentas
    - Ver historial de comportamiento (penalidades, disputas)
```

---

## Flujo 8: Historial por rol

### Vendedor

```
[SELLER] "Mis publicaciones"
→ Filtra por estado: AVAILABLE / RESERVED / IN_TRANSFER / COMPLETED / CANCELLED
→ Ve operación asociada a cada publicación
→ Puede subir evidencia cuando está en SELLER_NOTIFIED
→ Ve historial de pagos recibidos
```

### Comprador

```
[BUYER] "Mis compras"
→ Ve operaciones por estado
→ Puede cancelar reserva (en PAYMENT_PENDING)
→ Puede subir comprobante (en PAYMENT_PENDING)
→ Puede confirmar recepción (en TRANSFERRED)
→ Puede abrir disputa (en TRANSFER_IN_PROGRESS o TRANSFERRED)
```

---

## Tabla de acciones por estado

| Estado operación | Acción | Actor |
|-----------------|--------|-------|
| AWAITING_SELLER | Aceptar / rechazar reserva | SELLER |
| AWAITING_SELLER | Expirar manualmente | ADMIN |
| PAYMENT_PENDING | Cancelar reserva | BUYER, ADMIN |
| PAYMENT_PENDING | Subir comprobante | BUYER |
| PAYMENT_PENDING | Confirmar pago | ADMIN |
| PAYMENT_RECEIVED | Notificar al vendedor | ADMIN |
| SELLER_NOTIFIED | Subir evidencia de transferencia | SELLER |
| SELLER_NOTIFIED | Forzar reembolso por vencimiento 48h | ADMIN |
| TRANSFER_IN_PROGRESS | Revisar evidencia | ADMIN |
| TRANSFER_IN_PROGRESS | Abrir disputa | BUYER |
| TRANSFERRED | Confirmar recepción | BUYER |
| TRANSFERRED | Abrir disputa | BUYER |
| TRANSFERRED | Forzar liberación (comprador inactivo) | ADMIN |
| BUYER_CONFIRMED | Liberar fondos | ADMIN |
| DISPUTED | Subir evidencia adicional | BUYER, SELLER |
| DISPUTED | Resolver disputa | ADMIN |
