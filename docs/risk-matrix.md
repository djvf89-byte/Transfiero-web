# Matriz de Riesgos — Transfiero v1.0

**Escala de probabilidad:** 1 (muy baja) → 5 (muy alta)
**Escala de impacto:** 1 (mínimo) → 5 (crítico)
**Puntuación = Probabilidad × Impacto**

---

## Riesgos operativos

| # | Riesgo | Prob. | Impacto | Score | Mitigación |
|---|--------|-------|---------|-------|------------|
| O1 | Vendedor vende la entrada fuera de la plataforma tras la reserva | 4 | 5 | 20 | Retener fondos del comprador hasta confirmación; política de suspensión de cuenta; penalidad en términos de servicio |
| O2 | Ticket falso (imagen editada o entrada inexistente) | 3 | 5 | 15 | Revisión manual por admin antes de aprobar publicación; solicitar evidencia de compra original |
| O3 | Ticket duplicado (vendedor lo transfiere a dos compradores) | 3 | 5 | 15 | Validación manual del estado de la entrada en la ticketera; entrada pasa a `RESERVED` inmediatamente |
| O4 | Vendedor desaparece luego de recibir el pago del comprador | 2 | 5 | 10 | Los fondos no se liberan hasta confirmación del comprador; admin puede iniciar reembolso |
| O5 | Comprador fraudulento (no paga o hace chargeback) | 3 | 4 | 12 | Fondos se verifican manualmente antes de notificar al vendedor; no iniciar transferencia sin `PAYMENT_RECEIVED` |
| O6 | Entrada no transferible (ticketera no permite cesión) | 3 | 4 | 12 | Vendedor debe declarar ticketera; admin verifica política de transferencia antes de aprobar; reembolso si no es posible |
| O7 | Disputa abusiva por parte del comprador | 3 | 3 | 9 | Admin tiene decisión final; política anti-abuso en términos de servicio |
| O8 | Demora excesiva del admin en procesar operaciones | 4 | 3 | 12 | SLA interno de atención (por definir); alertas de operaciones pendientes en dashboard |
| O9 | Vendedor no sube evidencia de transferencia | 3 | 3 | 9 | Plazo máximo para subir evidencia (por definir); recordatorios automáticos o manuales |

---

## Riesgos técnicos

| # | Riesgo | Prob. | Impacto | Score | Mitigación |
|---|--------|-------|---------|-------|------------|
| T1 | Condición de carrera en reservas (dos compradores reservan simultáneamente) | 3 | 4 | 12 | Transacción atómica en DB al crear reserva; bloqueo optimista con Prisma |
| T2 | Pérdida de evidencia (imágenes en Cloudinary eliminadas) | 2 | 4 | 8 | No eliminar imágenes de operaciones; política de retención en Cloudinary |
| T3 | Escalada no autorizada de roles | 2 | 5 | 10 | Middleware de autorización en todas las rutas de API; validación server-side siempre |
| T4 | Exposición de datos sensibles (DNI, cuentas bancarias) | 2 | 5 | 10 | Cifrado en campos sensibles; no loggear datos personales; HTTPS obligatorio |
| T5 | Manipulación de precios en el frontend | 2 | 4 | 8 | Toda validación de precio en el servidor; nunca confiar en valores del cliente |
| T6 | Sesiones no invalidadas tras cambio de rol o suspensión | 2 | 4 | 8 | Invalidar sesión NextAuth al cambiar estado de usuario; verificar estado en middleware |
| T7 | Downtime de Vercel durante operación activa | 1 | 3 | 3 | Notificar manualmente; los fondos siempre están en custodia del admin |

---

## Riesgos legales / regulatorios

| # | Riesgo | Prob. | Impacto | Score | Mitigación |
|---|--------|-------|---------|-------|------------|
| L1 | Regulación de servicios de pago en Perú (SBS) | 3 | 5 | 15 | Consultar con asesor legal antes del lanzamiento; evaluar si se requiere licencia de dinero electrónico |
| L2 | Responsabilidad por entradas falsas vendidas en la plataforma | 3 | 4 | 12 | Términos de servicio claros; Transfiero es intermediario, no vendedor; proceso de reembolso definido |
| L3 | Violación a Ley de Protección de Datos Personales (Ley 29733) | 2 | 4 | 8 | Política de privacidad; consentimiento explícito; no retener datos más de lo necesario |
| L4 | Reputación dañada por un caso viral de estafa | 2 | 5 | 10 | Proceso de disputa rápido y transparente; comunicación proactiva con usuarios afectados |

---

## Resumen por prioridad

| Prioridad | Riesgos | Acción requerida |
|-----------|---------|-----------------|
| Crítica (≥15) | O1, O2, O3, L1 | Mitigar antes del lanzamiento |
| Alta (10–14) | O4, O5, O6, O8, T1, T3, T4, L2, L4 | Plan de mitigación documentado |
| Media (6–9) | O7, O9, T2, T5, T6, L3 | Monitorear; mitigar en siguientes versiones |
| Baja (≤5) | T7 | Aceptar o mitigar en V2 |

---

## Pendientes de decisión (afectan riesgos)

- Tiempo de expiración de una reserva sin pago (O8, O9).
- Plazo máximo para que el vendedor suba evidencia de transferencia (O9).
- Política de penalización por incumplimiento del vendedor (O1).
- Consulta legal sobre operación de escrow en Perú (L1).
