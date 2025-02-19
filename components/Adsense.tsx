import Script from "next/script";


const Adsense = ({ pId }: {pId: string}) => {
  // if (process.env.NODE_ENV !== "production") {
  //   return null;
  // }
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default Adsense;