"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from "../app/i18n";
import { AnimatedTestimonials } from "./ui/animated-testimonials";

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
    <div className="relative top-32">
      <h2 className="text-center text-4xl font-bold mb-12">{t('testimonials_title')}</h2>
          
      <div className="max-w-4xl w-full mx-auto">
        <AnimatedTestimonials
          testimonials={testimonials.map((testimonial) => ({
            name: testimonial.name,
            position: testimonial.title,
            quote: testimonial.content,
            image: testimonial.image,
            designation: testimonial.title,
            src: testimonial.image
          }))}
        />
      </div>
    </div>
  );
};

export default Testimonials;
