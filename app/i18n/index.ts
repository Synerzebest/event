import { useState, useEffect, useMemo, useRef } from 'react'; // Ajout de useRef ici
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';
import { i18n as i18nType } from 'i18next';

// Cache global pour les instances i18n
const instanceCache = new Map();

const initI18next = async (lng: string, ns: string) => {
  const cacheKey = `${lng}-${ns}`;
  let i18nInstance = instanceCache.get(cacheKey);

  if (!i18nInstance) {
    i18nInstance = createInstance();
    await i18nInstance
      .use(initReactI18next)
      .use(
        resourcesToBackend((language: string, namespace: string) =>
          import(`./locales/${language}/${namespace}.json`)
        )
      )
      .init(getOptions(lng, ns));

    instanceCache.set(cacheKey, i18nInstance);
  }

  return i18nInstance;
};

// Hook de traduction
export function useTranslation(
  lng: string,
  ns: string | string[],
  options: { keyPrefix?: string } = {}
) {
  const [i18nInstance, setI18nInstance] = useState<i18nType | null>(null);

  // Normalisez et mémorisez les namespaces
  const normalizedNs = useMemo(() => (Array.isArray(ns) ? ns[0] : ns), [ns]);

  // Utilisation de useRef pour garder l'instance i18n persistante
  const i18nInstanceRef = useRef<i18nType | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadI18n = async () => {
      // Si l'instance existe déjà, ne la chargeons pas à nouveau
      if (!i18nInstanceRef.current) {
        const instance = await initI18next(lng, normalizedNs);
        if (isMounted) {
          i18nInstanceRef.current = instance;
          setI18nInstance(instance); // Mettre à jour l'état une fois l'instance prête
        }
      } else {
        setI18nInstance(i18nInstanceRef.current); // Utiliser l'instance en cache
      }
    };

    loadI18n();

    return () => {
      isMounted = false;
    };
  }, [lng, normalizedNs]); // Dépend seulement des langues et namespaces

  if (!i18nInstance) {
    // Si i18nInstance est null, retournez un objet de secours
    return {
      t: (key: string) => key,
      i18n: {
        changeLanguage: () => Promise.resolve(),
      },
    };
  }

  return {
    t: i18nInstance.getFixedT(lng, normalizedNs, options.keyPrefix),
    i18n: i18nInstance,
  };
}
