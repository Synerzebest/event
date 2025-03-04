import type { Metadata } from "next";
import "./globals.css";
import { dir } from "i18next";
import { languages } from "../i18n/settings";
import Script from "next/script";
import Adsense from "@/components/Adsense"; 

const GoogleAdsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID || "";

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const metadata: Metadata = {
  title: "EaseEvent",
  description: "Le meilleur endroit pour trouver un événement !",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    lng: string;
  };
}

export default function RootLayout({ children, params: { lng } }: RootLayoutProps) {
  return (
    <html lang={lng} dir={dir(lng)}>
      <head>
        
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {GoogleAdsenseId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GoogleAdsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="antialiased">
        <Adsense pId={GoogleAdsenseId} />
        {children}
      </body>
    </html>
  );
}
