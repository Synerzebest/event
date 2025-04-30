"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input, Button } from "antd";
import { IoLocationOutline } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { FlipWords } from "./ui/flip-words";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { i18n as I18nType } from "i18next";
import { motion } from "framer-motion";


const Hero = () => {
  const lng = useLanguage();
  const { t, i18n } = useTranslation(lng, "common");
  const i18nInstance = i18n as I18nType | null;
  const [isLoaded, setIsLoaded] = useState(false);
  const [location, setLocation] = useState("");

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
    <div className="relative min-h-screen sm:h-[70vh] md:h-[65vh] w-full mx-auto overflow-hidden flex flex-col items-center justify-center">
      {/* Blobs de fond animés */}
      <motion.div
        className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-indigo-400 opacity-20 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-48 -right-32 w-[400px] h-[400px] bg-pink-400 opacity-20 rounded-full blur-3xl z-0"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10rem] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-400 opacity-25 rounded-full blur-[120px] z-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Contenu */}
      <div className="z-10 text-center px-4 sm:px-12 flex flex-col justify-center items-center gap-6 w-full">
        <h1 className="text-4xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          <FlipWords className="text-indigo-600" /> {safeTranslate(t, "hero_title")}
        </h1>

        <p className="text-lg text-gray-600 mt-4">
          {safeTranslate(t, "hero_subtitle")}
        </p>

        <div className="w-full flex flex-col gap-2 mt-4 items-center">
          <p className="text-sm text-gray-500 font-medium">{safeTranslate(t, "suggestion")}</p>
          <div className="w-full max-w-md relative flex justify-center">
            <Input
              size="large"
              placeholder="Bruxelles, Liège, ..."
              prefix={<IoLocationOutline className="text-gray-500 text-lg" />}
              className="w-full rounded-full bg-gray-50 focus:bg-white transition-colors border border-gray-300 focus:border-gray-400 shadow-inner"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              suffix={<FiSearch className="text-gray-500 text-lg" />}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
          <Link href={`/${lng}/explore`}>
            <Button size="large" type="default" className="rounded-full px-6">
              {safeTranslate(t, "hero_button")}
            </Button>
          </Link>
          <Link href={`/${lng}/eventlab`}>
            <Button size="large" type="primary" className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700">
              {safeTranslate(t, "cta_button")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;
