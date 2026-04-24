import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      className="fixed inset-0 bg-[#08060a] flex flex-col items-center justify-center text-white font-figtree gap-4"
    >
      <p className="text-[clamp(80px,14vw,160px)] italic font-normal leading-none tracking-[-0.03em] text-white/[0.08] select-none m-0">
        404
      </p>

      <p className="text-[clamp(13px,1.3vw,16px)] text-[#E2E2E2] tracking-[0.18em] uppercase m-0">
        Pagina nu a fost găsită
      </p>

      <Link
        href="/"
        className="relative inline-block mt-6 px-7 py-[10px] text-[13px] tracking-[0.14em] uppercase text-[#E2E2E2] no-underline transition-colors duration-[250ms] hover:text-white"
      >
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/[0.35]" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/[0.35]" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/[0.35]" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/[0.35]" />
        Înapoi acasă
      </Link>
    </div>
  )
}
