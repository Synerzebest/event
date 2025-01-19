"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "../app/i18n";

interface SubHeroProps {
  title: string;
  subtitle: string;
  lng: "en" | "fr" | "nl";
}

const SubHero = ({ title, subtitle, lng }: SubHeroProps) => {
  const { t, i18n } = useTranslation(lng, "common");
  const [features, setFeatures] = useState<
    Array<{ title: string; description: string; image: string }> | null
  >(null);

  useEffect(() => {
    if (i18n) {
      // Récupération des traductions
      const translatedFeatures = t("features", { returnObjects: true }) as
        | Array<{ title: string; description: string; image: string }>
        | null;

      if (Array.isArray(translatedFeatures)) {
        setFeatures(translatedFeatures);
      } else {
        console.error("Features is not an array. Check your translations or configuration!");
      }
    }
  }, [i18n]);

  if (!features) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-xl font-bold">
        Loading features...
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50 relative top-60">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">{title}</h2>
        <p className="text-lg text-gray-600 mb-12 mx-4">{subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-lg hover:bg-gray-50 duration-300 max-w-[95%] mx-auto"
            >
              <h3 className="text-2xl font-semibold mb-2 pt-6">{feature.title}</h3>
              <div className="relative h-32">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">{feature.description}</p>
                <Link href="/learn-more" className="text-blue-500 font-bold hover:underline">
                  {t('learn_more')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubHero;
