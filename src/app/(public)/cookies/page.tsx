export default function CookiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-400">Legal</p>
        <h1 className="text-4xl font-extrabold text-white">Política de cookies</h1>
        <p className="mt-3 text-sm text-white/40">Última actualización: junio 2025</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-white/60">

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten que la plataforma recuerde información sobre tu visita para mejorar tu experiencia.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Cookies que utilizamos</h2>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <p className="mb-1 font-bold text-white">Cookies esenciales</p>
              <p>Necesarias para el funcionamiento básico de la plataforma: sesión de usuario, autenticación y seguridad. No pueden desactivarse.</p>
              <p className="mt-2 text-xs text-white/35">Ejemplos: <code className="text-amber-400/70">next-auth.session-token</code>, <code className="text-amber-400/70">__Host-next-auth.csrf-token</code></p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <p className="mb-1 font-bold text-white">Cookies funcionales</p>
              <p>Recuerdan tus preferencias dentro de la plataforma (idioma, filtros de búsqueda, configuración de cuenta) para personalizar tu experiencia.</p>
            </div>

            <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <p className="mb-1 font-bold text-white">Cookies analíticas</p>
              <p>Nos ayudan a entender cómo los usuarios interactúan con la plataforma para mejorar su rendimiento y usabilidad. Los datos son anónimos y agregados.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Cookies de terceros</h2>
          <p>Algunos servicios integrados en Transfiero pueden establecer sus propias cookies:</p>
          <ul className="mt-2 space-y-2 list-disc list-inside">
            <li><span className="text-white font-semibold">MercadoPago:</span> cookies necesarias para el procesamiento seguro de pagos.</li>
            <li><span className="text-white font-semibold">Cloudinary:</span> para la entrega optimizada de imágenes.</li>
            <li><span className="text-white font-semibold">Spotify Embed:</span> si interactúas con el reproductor musical, Spotify puede establecer cookies según su propia política.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Duración</h2>
          <ul className="space-y-2 list-disc list-inside">
            <li><span className="text-white font-semibold">Cookies de sesión:</span> se eliminan al cerrar el navegador.</li>
            <li><span className="text-white font-semibold">Cookies persistentes:</span> permanecen entre 30 días y 1 año según su función.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Control de cookies</h2>
          <p>
            Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta que desactivar las cookies esenciales puede impedir el correcto funcionamiento de la plataforma (no podrás iniciar sesión ni completar operaciones).
          </p>
          <p className="mt-3">Guías por navegador:</p>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
            <li>Firefox: Opciones → Privacidad y seguridad</li>
            <li>Safari: Preferencias → Privacidad</li>
            <li>Edge: Configuración → Privacidad, búsqueda y servicios</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-white">Contacto</h2>
          <p>
            Si tienes preguntas sobre el uso de cookies en Transfiero, escríbenos a{" "}
            <span className="text-amber-400">privacidad@transfiero.pe</span>
          </p>
        </section>

      </div>
    </div>
  )
}
