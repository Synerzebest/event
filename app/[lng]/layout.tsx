import type { Metadata } from "next";
import "./globals.css";
import { dir } from "i18next";
import { languages } from "../i18n/settings";
import { Adsense } from "../../components";

const GoogleAdsenseId = process.env.GOOGLE_ADSENSE_ID || "";

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export const metadata: Metadata = {
  title: "EaseEvent",
  description: "Le meilleur endroit pour trouver un événement ! Que ce soit pour rejoindre ou créer un événement, EaseEvent vous facilite la vie !",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    lng: string; 
  };
}

export default function RootLayout({ children, params: { lng } }: RootLayoutProps){
  return (
      <html lang={lng} dir={dir(lng)}>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body
          className={`antialiased`}
        >
          <Adsense pId={GoogleAdsenseId} />
          {children}
        </body>
      </html>
  );
}
