import { useState, useEffect } from "react";

const useLanguage = (): "fr" | "en" | "nl" => {
  const [lng, setLng] = useState<"fr" | "en" | "nl">("fr");

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )i18next=([^;]*)/);
    if (match) {
      const language = match[1] as "fr" | "en" | "nl";
      if (["fr", "en", "nl"].includes(language)) {
        setLng(language);
      }
    }
  }, []);

  return lng;
};

export default useLanguage;
