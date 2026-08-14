import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de privacidad — Transfiero",
  description:
    "Conoce cómo Transfiero trata tus datos personales conforme a la Ley N° 29733 de Protección de Datos Personales del Perú.",
  alternates: { canonical: "/privacidad" },
  openGraph: { title: "Política de privacidad — Transfiero", url: "/privacidad" },
}

export default function PrivacidadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">Legal</p>
        <h1 className="text-4xl font-extrabold text-white">Política de privacidad</h1>
        <p className="mt-3 text-sm text-white/40">Última actualización: junio 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-white/60">

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">1. Responsable del tratamiento</h2>
          <p>
            Transfiero es responsable del tratamiento de los datos personales recopilados a través de la plataforma, de conformidad con la Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su reglamento.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">2. Datos que recopilamos</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><span className="text-white font-semibold">Datos de registro:</span> nombre, correo electrónico, número de teléfono.</li>
            <li><span className="text-white font-semibold">Datos de identidad:</span> DNI u otro documento (para vendedores verificados).</li>
            <li><span className="text-white font-semibold">Datos de operación:</span> historial de compras, ventas y pagos.</li>
            <li><span className="text-white font-semibold">Datos técnicos:</span> dirección IP, tipo de dispositivo, navegador, cookies de sesión.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">3. Finalidad del tratamiento</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>Gestionar el registro y autenticación de usuarios.</li>
            <li>Procesar operaciones de compraventa y pagos en custodia.</li>
            <li>Verificar la identidad de vendedores.</li>
            <li>Resolver disputas y atender solicitudes de soporte.</li>
            <li>Cumplir obligaciones legales y prevenir fraudes.</li>
            <li>Enviar notificaciones relacionadas con tus operaciones activas.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">4. Base legal</h2>
          <p>
            El tratamiento de tus datos se basa en el consentimiento otorgado al registrarte, la ejecución del contrato de intermediación y el cumplimiento de obligaciones legales aplicables.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">5. Compartición de datos</h2>
          <p>No vendemos ni cedemos tus datos personales a terceros. Solo los compartimos con:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Proveedores de servicios técnicos (almacenamiento, pagos) bajo contratos de confidencialidad.</li>
            <li>Autoridades competentes cuando sea requerido por ley.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">6. Conservación de datos</h2>
          <p>
            Conservamos tus datos mientras mantengas una cuenta activa en Transfiero y por el tiempo adicional requerido por obligaciones legales o fiscales (mínimo 5 años para registros de transacciones).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">7. Tus derechos</h2>
          <p>Conforme a la Ley N° 29733, tienes derecho a:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li><span className="text-white font-semibold">Acceso:</span> conocer qué datos tenemos sobre ti.</li>
            <li><span className="text-white font-semibold">Rectificación:</span> corregir datos inexactos o incompletos.</li>
            <li><span className="text-white font-semibold">Cancelación:</span> solicitar la eliminación de tus datos.</li>
            <li><span className="text-white font-semibold">Oposición:</span> oponerte al tratamiento en determinadas circunstancias.</li>
          </ul>
          <p className="mt-3">Para ejercer estos derechos escríbenos a: <span className="text-amber-400">privacidad@transfiero.pe</span></p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">8. Seguridad</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado, pérdida o destrucción. Los datos sensibles se almacenan cifrados y el acceso está restringido al personal autorizado.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">9. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política periódicamente. Te notificaremos por correo electrónico ante cambios sustanciales. La fecha de última actualización siempre estará visible al inicio de este documento.
          </p>
        </section>

      </div>
    </div>
  )
}
