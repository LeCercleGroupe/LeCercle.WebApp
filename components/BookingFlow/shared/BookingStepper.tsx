interface BookingStepperProps {
  currentStep: number;
  totalSteps?: number;
  label?: string;
}

export default function BookingStepper({ currentStep, totalSteps = 6, label }: BookingStepperProps) {
  return (
    <div className="flex gap-1.5 items-center">
      <div className="flex gap-1.5 items-center shrink-0">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isPast = step < currentStep;
          return (
            <div
              key={step}
              className={`h-1 rounded-sm transition-all duration-300 ${
                isActive ? "w-7 bg-white" : isPast ? "w-4 bg-[#8e8e8e]" : "w-4 bg-[#474747]"
              }`}
            />
          );
        })}
      </div>
      <p className="text-sm font-medium text-[#8e8e8e] tracking-tight whitespace-nowrap font-figtree">
        {label ?? `Pasul ${currentStep} din ${totalSteps}`}
      </p>
    </div>
  );
}
