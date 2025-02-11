import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { FlipWords } from "./ui/flip-words";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { AuroraBackground } from "./ui/aurora-background";


const Hero = () => {
  const lng = useLanguage();
  const { t, i18n } = useTranslation(lng, "common");

  const [words, setWords] = useState<string[]>([]);
  const prevWordsRef = useRef<string[]>([]);

  // Fonction pour récupérer les mots traduits
  const getTranslatedWords = useCallback(() => {
    const translated = t("hero_title_words", { returnObjects: true });
    
    // Vérifie que les traductions sont bien un tableau de chaînes
    if (Array.isArray(translated) && translated.every((word) => typeof word === "string")) {
      return translated as string[];
    } else {
      console.error("Translation 'hero_title_words' is not a valid array of strings.", translated);
      return [];
    }
  }, [t]);

  useEffect(() => {
    if (i18n) {
      const translatedWords = getTranslatedWords();

      // Vérifier si les mots ont changé pour éviter des re-rendus inutiles
      if (JSON.stringify(translatedWords) !== JSON.stringify(prevWordsRef.current)) {
        setWords(translatedWords);
        prevWordsRef.current = translatedWords;
      }
    }
  }, [i18n, getTranslatedWords]);

  return (

    <AuroraBackground>
      <div className="relative sm:top-24 top-8 h-[550px] w-full h-auto flex flex-col lg:flex-row items-center justify-center">
        <div className="z-2 text-center p-4 sm:p-8 flex flex-col items-center lg:text-left">
          <h1 className="text-5xl text-center text-white sm:text-5xl md:text-6xl font-bold mb-4">
            {words.length > 0 && <FlipWords words={words} />} {t("hero_title")}
          </h1>
          <p className="text-lg text-center text-white sm:text-xl md:text-2xl">{t("hero_subtitle")}</p>
          <Link href="/explore">
            <button className="flex items-center gap-2 text-xl text-white bg-[rgba(0,0,0,0.3)] backdrop-blur-md border border-[rgba(255,255,255,0.3)] py-4 px-6 mt-8 font-bold rounded-xl hover:bg-[rgba(255,255,255,0.3)] duration-300 shadow-lg">           
              {t("hero_button")}
            </button>
          </Link>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default Hero;
