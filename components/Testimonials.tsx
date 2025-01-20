"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useTranslation } from "../app/i18n";

interface TestimonialsProps {
  lng: "fr" | "en" | "nl";
}

const Testimonials = ({ lng }: TestimonialsProps) => {
  const { t, i18n } = useTranslation(lng, "common");
  const [testimonials, setTestimonials] = useState<
    Array<{ name: string; title: string; content: string; image: string }>
  >([]); // Initialiser avec un tableau vide

  const prevTestimonialsRef = useRef<
    Array<{ name: string; title: string; content: string; image: string }> | null
  >(null);

  // Utilisation de useCallback pour éviter la recréation de la fonction t à chaque rendu
  const getTranslatedTestimonials = useCallback(() => {
    return t("testimonials", { returnObjects: true }) as
      | Array<{ name: string; title: string; content: string; image: string }>
      | null;
  }, [t]); // Dépendance uniquement sur `t`

  useEffect(() => {
    if (i18n) {
      const translatedTestimonials = getTranslatedTestimonials();

      // Vérifier si les traductions ont changé
      if (
        translatedTestimonials &&
        Array.isArray(translatedTestimonials) && // Vérification que c'est bien un tableau
        (!prevTestimonialsRef.current || JSON.stringify(translatedTestimonials) !== JSON.stringify(prevTestimonialsRef.current))
      ) {
        setTestimonials(translatedTestimonials);
        prevTestimonialsRef.current = translatedTestimonials; // Mémoriser les traductions actuelles
      } else {
        console.error("Testimonials is not an array or has not changed.");
      }
    }
  }, [i18n, getTranslatedTestimonials]); // Se déclenche uniquement si `i18n` ou `getTranslatedTestimonials` change

  if (testimonials.length === 0) {
    return (
      <div className="w-full h-40 flex items-center justify-center text-xl font-bold">
        Loading testimonials...
      </div>
    );
  }

  return (
    <div className="py-20 relative top-64">
      <h2 className="text-center text-4xl font-bold mb-12">{t('testimonials_title')}</h2>
      
      <div className="flex flex-wrap justify-center gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="max-w-sm w-full lg:w-1/3 p-4 hover:scale-105 duration-300">
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center text-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={400}
                  height={300}
                />
              </div>
              <h3 className="font-bold text-xl">{testimonial.name}</h3>
              <p className="text-sm text-gray-500">{testimonial.title}</p>
              <p className="mt-4 text-gray-700 italic">&quot;{testimonial.content}&quot;</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
