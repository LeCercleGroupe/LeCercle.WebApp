import type { GallerySection as GallerySectionProps } from "@/components/VenuePage/types";
import Image from "next/image";

export default function GallerySection({
  heading,
  images,
}: GallerySectionProps) {
  return (
    <section className="relative bg-white pt-24 px-6">
      <div className="max-w-5xl mx-auto h-full sm:max-h-450 overflow-hidden">
        <h2 className="font-eb-garamond text-3xl sm:text-4xl font-normal text-[#1a1208] text-center mb-12">
          {heading}
        </h2>

        <div className="columns-1 sm:columns-3 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="break-inside-avoid mb-4">
              <Image
                src={img.src}
                alt={img.alt}
                width={600}
                height={400}
                className="w-full object-cover object-center rounded-lg"
                sizes="33vw"
              />
            </div>
          ))}
        </div>

        {/* White fade over the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-linear-to-t from-white from-50% via-white to-transparent pointer-events-none z-10" />
      </div>
    </section>
  );
}
