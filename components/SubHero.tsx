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
  >([]); // Initialiser avec un tableau vide

  const prevFeaturesRef = useRef<Array<{ title: string; description: string; image: string }> | null>(null);

  // Utilisation de useCallback pour éviter la recréation de la fonction t à chaque rendu
  const getTranslatedFeatures = useCallback(() => {
    return t("features", { returnObjects: true }) as
      | Array<{ title: string; description: string; image: string }>
      | null;
  }, [t]); // Dépendance uniquement sur `t`, ce qui évite des changements inutiles

  useEffect(() => {
    if (i18n) {
      // Récupération des traductions
      const translatedFeatures = getTranslatedFeatures();

      // Vérifier si les traductions ont changé
      if (
        translatedFeatures &&
        Array.isArray(translatedFeatures) && // Vérification que c'est bien un tableau
        (!prevFeaturesRef.current || JSON.stringify(translatedFeatures) !== JSON.stringify(prevFeaturesRef.current))
      ) {
        setFeatures(translatedFeatures);
        prevFeaturesRef.current = translatedFeatures; // Mémoriser les traductions actuelles
      } else {
        console.error("Features is not an array or has not changed.");
      }
    }
  }, [i18n, getTranslatedFeatures]); // Se déclenche uniquement si `i18n` ou `getTranslatedFeatures` change

  if (features.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-xl font-bold">
        Loading features...
      </div>
    );
  }

  return (
    <section className="py-16 bg-slate-100 relative">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">{safeTranslate(t,'subhero_title')}</h2>
        <p className="text-lg text-gray-600 mb-12 mx-4">{safeTranslate(t, "subhero_subtitle")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
          {features.map((feature) => (
            <motion.div
            key={feature.title}
            whileHover={{ scale: 1.02, boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)" }}
            className="relative bg-white rounded-2xl shadow-lg overflow-hidden
                       transition-all duration-300 mx-auto border border-gray-200"
          >
            {/* Image animée */}
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
    </section>
  );
};

export default SubHero;
