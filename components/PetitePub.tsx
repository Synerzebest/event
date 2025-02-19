"use client"

import { useEffect } from "react";
import Script from "next/script";

const Adsense = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.adsbygoogle || !Array.isArray(window.adsbygoogle)) {
        window.adsbygoogle = []; // Forcer le tableau
      }
      window.adsbygoogle.push({ push: () => {} }); // Ajout avec typage valide
    }
  }, []);

  const pId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || "";

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={pId}
        data-ad-slot="1234567890" // Remplace avec ton slot ID
        data-ad-format="auto"
      ></ins>
    </>
  );
};

export default Adsense;
