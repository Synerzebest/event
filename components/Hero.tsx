"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlipWords } from "./ui/flip-words";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { i18n as I18nType } from "i18next";

const hero_image = "/images/hero-bg.png";

const Hero = () => {
  const lng = useLanguage();
  const { t, i18n } = useTranslation(lng, "common");
  const i18nInstance = i18n as I18nType | null;
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!i18nInstance) return;

    if (i18nInstance.language !== lng) {
      i18nInstance.changeLanguage(lng).then(() => {
        document.cookie = `i18next=${lng}; path=/`;
        setIsLoaded(true);
      });
    } else {
      setIsLoaded(true);
    }
  }, [lng, i18nInstance]);

  const safeTranslate = (t: (key: string, options?: Record<string, unknown>) => string | object, key: string, options?: Record<string, unknown>): string => {
    const result = t(key, options);
    return typeof result === "string" ? result : JSON.stringify(result);
  };

  if (!isLoaded) return <p className="text-center text-white">Chargement...</p>;

  return (
    <div 
      className="relative top-24 sm:top-36 h-screen sm:w-[95%] w-full mx-auto sm:mx-none overflow-hidden rounded-none sm:rounded-2xl z-20 flex flex-col lg:flex-row items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${hero_image})` }}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
  
      <div className="relative top-0 sm:top-12 z-10 text-center p-4 sm:p-8 flex flex-col justify-center items-center gap-4 lg:text-left">
        <h1 className="text-4xl text-white text-center sm:text-5xl md:text-6xl font-bold w-full break-words">
          <span className="inline">
            <FlipWords />
          </span>
          {" "}{safeTranslate(t, "hero_title")}
        </h1>
  
        <p className="text-lg text-center sm:text-xl md:text-2xl text-gray-300">
          {safeTranslate(t, "hero_subtitle")}
        </p>
  
        <div className="sm:mt-36 mt-12 sm:mt-24 flex flex-col sm:flex-row items-center gap-4">
          <Link href={`/${lng}/explore`}>
            <button className="flex items-center gap-2 text-xl text-white bg-transparent bg-opacity-80 backdrop-blur-md border border-[rgba(255,255,255,0.3)] py-4 px-6 font-bold rounded-xl hover:bg-indigo-600 duration-300 shadow-lg">
              {safeTranslate(t, "hero_button")}
            </button>
          </Link>
          <Link href={`/${lng}/eventlab`}>
            <button className="flex items-center gap-2 text-xl text-white bg-transparent bg-opacity-80 backdrop-blur-md border border-[rgba(255,255,255,0.3)] py-4 px-6 font-bold rounded-xl hover:bg-amber-600 duration-300 shadow-lg">
              {safeTranslate(t, "cta_button")}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
  
};

export default Hero;
