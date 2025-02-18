import type { Metadata } from "next";
import "./globals.css";
import { dir } from "i18next";
import { languages } from "../i18n/settings";
import { Adsense } from "../../components";

const GoogleAdsenseId = process.env.GOOGLE_ADSENSE_ID || "";

if (!GoogleAdsenseId) {
  console.log("Google Adsense ID not provided")
}

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export const metadata: Metadata = {
  title: "EventEase",
  description: "Create And Manage Your Events With Ease",
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
