"use client";
import { Adsense } from "@/components";

const GoogleAdsenseId = process.env.GOOGLE_ADSENSE_ID || "";

if (!GoogleAdsenseId) {
  console.log("Google Adsense ID not provided")
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
        <Adsense pId={GoogleAdsenseId} />
        </body>
    </html>
  );
}
