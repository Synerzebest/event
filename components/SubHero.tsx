"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "../app/i18n";
import { motion } from "framer-motion";
import { safeTranslate } from "@/lib/utils";
import useLanguage from "@/lib/useLanguage";

const SubHero = () => {
  const lng = useLanguage();
  const { t, i18n } = useTranslation(lng, "common");
  const [features, setFeatures] = useState<
    Array<{ title: string; description: string; image: string }>
  >([]);

  const prevFeaturesRef = useRef<Array<{ title: string; description: string; image: string }> | null>(null);

  const getTranslatedFeatures = useCallback(() => {
    return t("features", { returnObjects: true }) as
      | Array<{ title: string; description: string; image: string }>
      | null;
  }, [t]);

  useEffect(() => {
    if (i18n) {
      const translatedFeatures = getTranslatedFeatures();

      if (
        translatedFeatures &&
        Array.isArray(translatedFeatures) &&
        (!prevFeaturesRef.current || JSON.stringify(translatedFeatures) !== JSON.stringify(prevFeaturesRef.current))
      ) {
        setFeatures(translatedFeatures);
        prevFeaturesRef.current = translatedFeatures;
      }
    }
  }, [i18n, getTranslatedFeatures]);

  if (features.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-xl font-bold">
        Loading features...
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white via-slate-50 to-slate-100 relative top-0">
      <div className="container mx-auto text-center">
        <h2 className="text-[1.7rem] sm:text-4xl font-bold mb-8">{safeTranslate(t, "subhero_title")}</h2>

        {/* Wrapper pour le scroll horizontal */}
        <div className="relative">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 p-8 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)" }}
                className="relative bg-white rounded-2xl shadow-lg overflow-hidden
                           transition-all duration-300 mx-auto border border-gray-200 min-w-[95%] sm:min-w-[60%] md:min-w-[auto] snap-center"
              >
                {/* Image */}
                <div className="relative h-40 w-full">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Contenu */}
                <div className="p-6 text-center">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubHero;
