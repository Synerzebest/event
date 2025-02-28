"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FlipWords } from "./ui/flip-words";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { AuroraBackground } from "./ui/aurora-background";
import { i18n as I18nType } from "i18next";

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
    <AuroraBackground>
      <div className="relative sm:top-24 top-8 h-[550px] w-full flex flex-col lg:flex-row items-center justify-center">
        <div className="z-2 text-center p-4 sm:p-8 flex flex-col items-center lg:text-left">
          <h1 className="text-4xl text-center text-blue-500 sm:text-5xl md:text-6xl font-bold mb-4">
            <span className="inline">
              <FlipWords />
            </span>
            {" "}{safeTranslate(t, "hero_title")}
          </h1>

          <p className="text-lg text-center sm:text-xl md:text-2xl text-blue-500">{safeTranslate(t,"hero_subtitle")}</p>
          <Link href="/explore">
            <button className="flex items-center gap-2 text-xl text-white bg-blue-500 border border-[rgba(255,255,255,0.3)] py-4 px-6 mt-8 font-bold rounded-xl hover:bg-blue-600 duration-300 shadow-lg">
              {safeTranslate(t,"hero_button")}
            </button>
          </Link>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default Hero;
