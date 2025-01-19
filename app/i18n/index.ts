import { useState, useEffect } from 'react';
import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { getOptions } from './settings';

// Initialiser i18next
const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend((language: any, namespace: any) =>
        import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, ns));
  return i18nInstance;
};

// Hook de traduction
export function useTranslation(
  lng: string,
  ns: string | string[],
  options: { keyPrefix?: string } = {}
) {
  const [i18nInstance, setI18nInstance] = useState<any>(null);

  useEffect(() => {
    const loadI18n = async () => {
      // Normalisation : Assurez-vous que ns est toujours un string.
      const normalizedNs = Array.isArray(ns) ? ns[0] : ns;
      const instance = await initI18next(lng, normalizedNs);
      setI18nInstance(instance);
    };

    loadI18n();
  }, [lng, ns]);

  if (!i18nInstance) {
    // Si i18nInstance est null, retournez un objet de secours
    return {
      t: (key: string) => key,
      i18n: {
        changeLanguage: () => Promise.resolve(),
      },
    };
  }

  // Utilisez le namespace normalisé
  const namespace = Array.isArray(ns) ? ns[0] : ns;

  return {
    t: i18nInstance.getFixedT(lng, namespace, options.keyPrefix),
    i18n: i18nInstance,
  };
}
