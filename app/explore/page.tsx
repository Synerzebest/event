import React from 'react';
import { Navbar, SearchAndFilters, Events, Footer } from '@/components';

const page = () => {
    return (
        <>
          <Navbar />
          <SearchAndFilters /> 
          <Events />
          <Footer />
        </>
    )
}

export default page
