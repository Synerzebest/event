import { useState, useEffect } from 'react';

const useLanguage = (): "fr" | "en" | "nl" => {
    const [lng, setLng] = useState<"fr" | "en" | "nl">("fr");

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )i18n=([^;]*)/);
        if (match) {
            const language = match[1] as "fr" | "en" | "nl"; // Assurer que c'est une des langues valides
            setLng(language);
        }
    }, []);

    return lng;
};

export default useLanguage;