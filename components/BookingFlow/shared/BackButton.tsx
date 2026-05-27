interface BackButtonProps {
  label?: string;
  onClick: () => void;
  danger?: boolean;
}

export default function BackButton({ label = "Pas anterior", onClick, danger }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex gap-1 items-center border rounded-full pl-2 pr-3.5 py-2 text-sm font-medium font-figtree tracking-tight transition-colors ${
        danger
          ? "bg-red-950/40 border-red-800/50 text-red-400 hover:bg-red-950/60"
          : "bg-[#1b1b1b] border-[#303030] text-[#c4c4c4] hover:bg-[#252525]"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="rotate-180">
        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
