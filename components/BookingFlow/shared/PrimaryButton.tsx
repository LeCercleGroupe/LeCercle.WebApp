import CornerBrackets from "./CornerBrackets";

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function PrimaryButton({ label, onClick, disabled = false, loading = false, className }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`relative w-full py-4 text-base font-medium font-figtree tracking-tight transition-all duration-200 ${
        isDisabled
          ? "bg-white/10 text-[#a8a8a8] cursor-not-allowed"
          : "bg-white/50 text-white hover:bg-white/60 cursor-pointer"
      } ${className ?? ""}`}
    >
      {loading
        ? <div className="mx-auto size-5 border border-[#a8a8a8] border-t-transparent rounded-full animate-spin" />
        : label}
      <CornerBrackets color={isDisabled ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.5)"} />
    </button>
  );
}
