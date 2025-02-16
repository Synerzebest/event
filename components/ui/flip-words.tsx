"use client";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/app/i18n";
import useLanguage from "@/lib/useLanguage";

export const FlipWords = ({
  duration = 3000,
  className,
}: {
  duration?: number;
  className?: string;
}) => {
  const lng = useLanguage();
  const { t } = useTranslation(lng, "common");

  const wordsRef = useRef<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string | null>(null);

  // Récupérer les traductions uniquement si elles changent
  useEffect(() => {
    const translatedWords = t("hero_title_words", { returnObjects: true }) as string[];
    if (
      Array.isArray(translatedWords) &&
      translatedWords.length > 0 &&
      JSON.stringify(translatedWords) !== JSON.stringify(wordsRef.current)
    ) {
      wordsRef.current = translatedWords;
      setCurrentWord(translatedWords[0]);
    }
  }, [t, lng]);

  useEffect(() => {
    if (!currentWord || wordsRef.current.length === 0) return;

    const interval = setInterval(() => {
      const currentIndex = wordsRef.current.indexOf(currentWord);
      const nextIndex = (currentIndex + 1) % wordsRef.current.length;
      setCurrentWord(wordsRef.current[nextIndex]);
    }, duration);

    return () => clearInterval(interval);
  }, [currentWord, duration]);

  if (!currentWord) return null; // Si pas de mot, on n'affiche rien

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10 }}
        exit={{
          opacity: 0,
          y: -40,
          x: 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
        }}
        className={cn("z-10 inline-block relative text-left", className)}
        key={currentWord}
      >
        {currentWord.split(" ").map((word, wordIndex) => (
          <motion.span
            key={word + wordIndex}
            initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: wordIndex * 0.3, duration: 0.3 }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={word + letterIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.3 + letterIndex * 0.05,
                  duration: 0.2,
                }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
