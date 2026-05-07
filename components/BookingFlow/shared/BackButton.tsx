interface BackButtonProps {
  label?: string;
  onClick: () => void;
}

export default function BackButton({ label = "Pas anterior", onClick }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex gap-1 items-center bg-[#1b1b1b] border border-[#303030] rounded-full pl-2 pr-3.5 py-2 text-sm font-medium text-[#c4c4c4] font-figtree tracking-tight hover:bg-[#252525] transition-colors"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="rotate-180">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
