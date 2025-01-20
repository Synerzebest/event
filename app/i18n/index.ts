import { useState, useEffect, useMemo } from 'react';
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';

// Cache global pour les instances i18n
const instanceCache = new Map();

const initI18next = async (lng: string, ns: string) => {
  const cacheKey = `${lng}-${ns}`;
  if (instanceCache.has(cacheKey)) {
    return instanceCache.get(cacheKey);
  }

  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: any, namespace: any) =>
        import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, ns));
  
  instanceCache.set(cacheKey, i18nInstance);
  return i18nInstance;
};

// Hook de traduction
export function useTranslation(
  lng: string,
  ns: string | string[],
  options: { keyPrefix?: string } = {}
) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  // Normalisez et mémorisez les namespaces
  const normalizedNs = useMemo(() => (Array.isArray(ns) ? ns[0] : ns), [ns]);

  useEffect(() => {
    let isMounted = true;

    const loadI18n = async () => {
      const instance = await initI18next(lng, normalizedNs);
      if (isMounted) {
        setI18nInstance(instance);
      }
    };

    loadI18n();

    return () => {
      isMounted = false; // Évite les fuites d'état
    };
  }, [lng, normalizedNs]);

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
