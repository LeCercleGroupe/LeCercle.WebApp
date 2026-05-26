interface Props {
  children: React.ReactNode;
}

export default function VenueLoadingScreen({ children }: Props) {
  return (
    <div className="min-h-svh bg-[#080808] flex items-center justify-center">
      {children}
    </div>
  );
}
