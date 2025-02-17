import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const safeTranslate = (t: (key: string, options?: Record<string, unknown>) => string | object, key: string, options?: Record<string, unknown>): string => {
  const result = t(key, options);

  if (typeof result === "string") {
      return result; // ✅ Retourne directement une chaîne
  } else if (Array.isArray(result)) {
      return result.join("\n"); // ✅ Convertit un tableau en une chaîne lisible
  } else if (typeof result === "object" && result !== null) {
      return "[Object]"; // ✅ Sécurise le cas où un objet est renvoyé accidentellement
  }

  return ""; // ✅ Valeur par défaut si rien n'est trouvé
};
