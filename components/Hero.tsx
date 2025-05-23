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
import { useRouter } from "next/navigation";


const Hero = () => {
  const lng = useLanguage();
  const { t, i18n } = useTranslation(lng, "common");
  const i18nInstance = i18n as I18nType | null;
  const [isLoaded, setIsLoaded] = useState(false);
  const [location, setLocation] = useState("");
  const router = useRouter();

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

  const handleSearch = () => {
    if (location.trim()) {
      const query = encodeURIComponent(location.trim());
      router.push(`/${lng}/explore?city=${query}`);
    }
  };

  if (!isLoaded) return <p className="text-center text-white">Chargement...</p>;

  return (
    <div className="relative min-h-screen sm:h-[70vh] md:h-[65vh] w-full mx-auto overflow-hidden flex flex-col items-center justify-center">
      {/* Blobs de fond */}
      <svg
        className="overflow-visible absolute -top-32 -left-32 w-[400px] h-[350px] sm:w-[400px] sm:h-[400px] z-0"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
          </filter>
        </defs>
        <circle cx="200" cy="200" r="200" fill="#6366f1" fillOpacity="0.2" filter="url(#blur1)" />
      </svg>

      <svg
        className="absolute top-48 -right-32 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] z-0 pointer-events-none overflow-visible"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
          </filter>
        </defs>
        <circle
          cx="200"
          cy="200"
          r="200"
          fill="#ec4899"
          fillOpacity="0.2"
          filter="url(#blur2)"
        />
      </svg>

      <svg
        className="absolute bottom-[-10rem] left-1/2 -translate-x-1/2 w-[400px] h-[400px] z-0 pointer-events-none overflow-visible"
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="120" />
          </filter>
        </defs>
        <circle
          cx="250"
          cy="250"
          r="250"
          fill="#a855f7"
          fillOpacity="0.25"
          filter="url(#blur3)"
        />
      </svg>


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
              onPressEnter={handleSearch}
              suffix={
                <div
                  onClick={handleSearch}
                  className="cursor-pointer text-gray-500 text-lg hover:text-gray-700"
                >
                  <FiSearch />
                </div>
              }
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
