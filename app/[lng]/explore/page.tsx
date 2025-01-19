"use client"

import React, { useState, useEffect } from 'react';
import { Navbar, SearchAndFilters, Events, Footer } from '@/components';
import { useTranslation } from "../../i18n";

interface PageProps {
  params: {
    lng: "en" | "nl" | "fr";
  }
}

const page = ({ params: { lng } } : PageProps) => {
  const [isLoading, setIsLoading] = useState(true)
    const { t, i18n } = useTranslation(lng, 'common')

  useEffect(() => {
    if (i18n) {
      setIsLoading(false)
    }
  }, [i18n])

  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center text-4xl text-white px-4 py-2 font-bold">Eventease</div>
  }
    return (
        <>
          <Navbar lng={lng} />
          <SearchAndFilters /> 
          <Events lng={lng} />
          <Footer />
        </>
    )
}

export default page
