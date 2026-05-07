interface CornerBracketsProps {
  color?: string;
  size?: number;
}

export default function CornerBrackets({ color = "rgba(255,255,255,0.16)", size = 15 }: CornerBracketsProps) {
  const s = size;
  const style = { borderColor: color };
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <span className={`absolute top-0 left-0 border-t border-l`} style={{ ...style, width: s + 2, height: s }} />
      <span className={`absolute top-0 right-0 border-t border-r`} style={{ ...style, width: s + 2, height: s }} />
      <span className={`absolute bottom-0 left-0 border-b border-l`} style={{ ...style, width: s + 2, height: s }} />
      <span className={`absolute bottom-0 right-0 border-b border-r`} style={{ ...style, width: s + 2, height: s }} />
    </div>
  );
}
