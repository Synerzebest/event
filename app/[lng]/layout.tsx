import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { dir } from "i18next";
import { languages } from "../i18n/settings";

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
  );
}
