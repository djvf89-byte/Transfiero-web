import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Términos de uso — Transfiero",
  description:
    "Lee los términos y condiciones de uso de Transfiero: comisiones, obligaciones, reembolsos, disputas y jurisdicción peruana.",
  alternates: { canonical: "/terminos" },
  openGraph: { title: "Términos de uso — Transfiero", url: "/terminos" },
}

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">Legal</p>
        <h1 className="text-4xl font-extrabold text-white">Términos de uso</h1>
        <p className="mt-3 text-sm text-white/40">Última actualización: junio 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-white/60">

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">1. Identidad del operador</h2>
          <p>
            Transfiero es una plataforma peruana de intermediación para la compraventa segura de entradas entre particulares. No somos una ticketera, no emitimos entradas ni organizamos eventos. Actuamos exclusivamente como intermediario neutral que retiene los fondos del comprador en custodia (escrow) hasta que se confirme la validez de la transacción.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">2. Objeto y naturaleza del servicio</h2>
          <p>
            Transfiero facilita la transferencia de entradas entre un vendedor (titular original) y un comprador interesado. La transferencia de la entrada debe realizarse a través de los canales oficiales de la ticketera o plataforma emisora correspondiente. Transfiero no interviene en la transferencia técnica de la entrada, solo garantiza la custodia del dinero durante el proceso.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">3. Aceptación y capacidad</h2>
          <p>
            El uso de la plataforma implica la aceptación plena de estos términos. Para operar como vendedor o comprador en Transfiero debes ser mayor de 18 años y tener capacidad legal para contratar según la legislación peruana vigente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">4. Comisiones</h2>
          <p>Las comisiones aplicadas sobre cada operación son:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li><span className="text-white font-semibold">Comprador:</span> 7% sobre el precio de venta</li>
            <li><span className="text-white font-semibold">Vendedor:</span> 3% sobre el precio de venta</li>
          </ul>
          <p className="mt-3">
            No existen costos ocultos. El monto total a pagar se muestra claramente antes de confirmar la reserva. Las entradas para eventos de espectáculos públicos están excluidas del derecho de desistimiento conforme al Código de Protección y Defensa del Consumidor (Ley N° 29571).
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">5. Proceso de reserva</h2>
          <p>
            Al reservar una entrada, el comprador dispone de un tiempo limitado para completar el pago. La reserva bloquea la entrada temporalmente. Si el pago no se confirma dentro del plazo establecido, la reserva se cancela automáticamente y la entrada vuelve a estar disponible.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">6. Obligaciones del vendedor</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>Ser el titular legítimo de la entrada publicada.</li>
            <li>Publicar información veraz: evento, fecha, lugar, sector y precio original.</li>
            <li>No superar el precio máximo de reventa permitido (110% del precio original).</li>
            <li>Subir evidencia válida de la entrada antes de enviarla a revisión.</li>
            <li>Realizar la transferencia oficial de la entrada al comprador dentro del plazo acordado tras aceptar la operación.</li>
            <li>No publicar entradas duplicadas ni inexistentes.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">7. Obligaciones del comprador</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li>Proporcionar datos correctos en su cuenta para facilitar la transferencia.</li>
            <li>Realizar el pago dentro del plazo de reserva.</li>
            <li>Confirmar la recepción válida de la entrada o abrir una disputa dentro del plazo establecido.</li>
            <li>No confirmar una entrada que no haya recibido correctamente.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">8. Custodia y liberación de fondos</h2>
          <p>
            El dinero del comprador queda retenido por Transfiero hasta que el comprador confirme la recepción válida de la entrada. Una vez confirmada, los fondos se liberan al vendedor descontando la comisión correspondiente. El comprador dispone de un plazo máximo de <strong className="text-white">24 horas</strong> para confirmar la recepción o abrir una disputa desde que Transfiero valida la transferencia. Si no actúa dentro de ese plazo, los fondos se liberan automáticamente al vendedor.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">9. Reembolsos</h2>
          <p>El comprador tiene derecho a reembolso únicamente en los siguientes casos:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>El vendedor no realizó la transferencia dentro del plazo acordado.</li>
            <li>La entrada recibida fue rechazada por la plataforma oficial o resultó ser inválida.</li>
            <li>Se comprueba fraude o engaño por parte del vendedor.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">10. Disputas</h2>
          <p>
            Si el comprador detecta un problema con la entrada recibida, puede abrir una disputa dentro del plazo establecido. Transfiero congelará los fondos y revisará el caso. La resolución se comunicará a ambas partes en un plazo máximo de 72 horas hábiles. La decisión de Transfiero es definitiva en el marco de la plataforma.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">11. Limitación de responsabilidad</h2>
          <p>
            Transfiero actúa como intermediario y no garantiza la asistencia al evento (cancelaciones, reprogramaciones o restricciones de acceso por parte del organizador quedan fuera de nuestro alcance). La responsabilidad máxima de Transfiero ante cualquier reclamo se limita al monto de las comisiones pagadas en la operación correspondiente.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">12. Propiedad intelectual</h2>
          <p>
            Todos los contenidos, marca, diseño y código de la plataforma Transfiero son propiedad exclusiva de sus titulares y están protegidos por la legislación peruana de propiedad intelectual. Queda prohibida su reproducción o uso sin autorización expresa.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">13. Modificaciones</h2>
          <p>
            Transfiero se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados con al menos 5 días de anticipación. El uso continuado de la plataforma tras la notificación implica aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">14. Jurisdicción</h2>
          <p>
            Estos términos se rigen por la legislación peruana vigente. Cualquier controversia será sometida a los tribunales competentes de la ciudad de Lima, Perú, renunciando las partes a cualquier otro fuero que pudiera corresponderles.
          </p>
        </section>

      </div>
    </div>
  )
}
