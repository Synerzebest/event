import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "../app/i18n";

interface SubHeroProps {
  title: string;
  subtitle: string;
  lng: "en" | "fr" | "nl";
}

const SubHero = ({ title, subtitle, lng }: SubHeroProps) => {
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubHero;
