const PASOS = [
  {
    icono: "💳",
    label: "Comprador paga",
    sub: "Fondos retenidos por Transfiero",
    cls: "bg-indigo-500/15",
  },
  {
    icono: "🔒",
    label: "Escrow activo",
    sub: "Fondos seguros durante la transferencia",
    cls: "border border-amber-500/25 bg-amber-500/12",
  },
  {
    icono: "🎟",
    label: "Vendedor transfiere",
    sub: "Entrada oficial al comprador",
    cls: "bg-violet-500/15",
  },
  {
    icono: "✅",
    label: "Comprador confirma",
    sub: "Fondos liberados al vendedor",
    cls: "bg-green-500/15",
  },
]

export function EscrowVisual() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 via-transparent to-indigo-500/4 px-7 py-6">
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-amber-500/6 blur-3xl" />

      <div className="flex items-center gap-6">
        {/* Descripción lateral */}
        <div className="hidden w-36 shrink-0 border-r border-white/7 pr-6 lg:block">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-amber-500">
            Cómo funciona
          </p>
          <p className="mb-1.5 text-sm font-extrabold leading-snug text-white">
            Protección escrow
          </p>
          <p className="text-[11px] leading-relaxed text-white/30">
            Tu dinero solo se libera cuando tú confirmas la entrada
          </p>
        </div>

        {/* Pasos */}
        <div className="flex flex-1 items-start">
          {PASOS.map((paso, i) => (
            <div key={paso.label} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center gap-2 text-center">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${paso.cls}`}
                >
                  {paso.icono}
                </div>
                <p className="text-[12px] font-bold leading-tight text-white/80">
                  {paso.label}
                </p>
                <p className="hidden text-[10px] leading-snug text-white/30 sm:block">
                  {paso.sub}
                </p>
              </div>
              {i < PASOS.length - 1 && (
                <div className="mt-4 w-8 shrink-0 text-center text-sm text-white/15">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
