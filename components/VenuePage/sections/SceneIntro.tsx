interface SceneIntroProps {
  heading: string;
  subheading?: string;
  accentColor: string;
}

export default function SceneIntro({
  heading,
  subheading,
  accentColor,
}: SceneIntroProps) {
  return (
    <div className="relative bg-black py-[14vh] flex items-center justify-center overflow-hidden">

      <h2 className="flex flex-col text-white text-[28px] sm:text-[48px] font-normal leading-[1.35] font-eb-garamond text-center px-8 max-w-4xl mx-auto">
        {heading}
        {subheading && (
          <div className="italic" style={{ color: accentColor }}>
            {subheading}
          </div>
        )}
      </h2>
    </div>
  );
}
