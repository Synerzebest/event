"use client";

import React, { useState } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import UserButton from "./UserButton";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "../app/i18n";
import { useRouter } from "next/navigation";
import { MdLanguage } from "react-icons/md";

interface NavbarProps {
  lng: string;
}

const Navbar = ({ lng }: NavbarProps) => {
  const { isSignedIn } = useAuth();
  const { t, i18n } = useTranslation(lng, ['common']);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!i18n) {
    return <div>Loading...</div>
  }

  const handleChangeLanguage = (newLng: string) => {
    if (i18n) {
      // Change la langue via i18n
      i18n.changeLanguage(newLng);
  
      // Utilise useRouter pour rediriger vers la même page avec la nouvelle langue
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/(en|fr|nl)/, `/${newLng}`);
      
      // Redirige vers la nouvelle URL sans recharger la page
      router.push(newPath);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="absolute w-[95%] top-0 sm:top-4 left-1/2 transform -translate-x-1/2 rounded-xl mt-2 flex justify-between items-center py-2 sm:px-12 px-4 
    bg-[rgba(0,0,0,0.8)] md:bg-[rgba(255,255,255,0.1)] backdrop-blur-xl border border-[rgba(255,255,255,0.2)] shadow-lg z-50">
      <div>
        <Link href={`/${lng}`}>
          <p className="text-4xl text-white px-4 py-2 rounded-xl font-bold drop-shadow-lg">
            Eventease
          </p>
        </Link>
      </div>
  
      <div className="hidden md:flex items-center gap-4"> {/* Desktop Menu */}
        <ul className="flex items-center">
          <li className="font-bold cursor-pointer text-xl text-white hover:bg-[rgba(255,255,255,0.2)] 
          duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}`}>{t('title')}</Link>
          </li>
          <li className="font-bold cursor-pointer text-xl text-white hover:bg-[rgba(255,255,255,0.2)] 
          duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}/explore`}>{t('explore')}</Link>
          </li>
          {isSignedIn ? (
            <>
              <li>
                <Link href={`/${lng}/eventlab`} className="font-bold cursor-pointer text-xl text-white 
                hover:bg-[rgba(255,255,255,0.2)] duration-300 py-2 px-4 rounded-lg">
                  EventLab
                </Link>
              </li>
              <li className="flex items-center">
                <UserButton lng={lng} />
              </li>
            </>
          ) : (
            <>
              <li className="font-bold cursor-pointer text-xl text-white hover:bg-[rgba(255,255,255,0.2)] 
              duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signin">Signin</Link>
              </li>
              <li className="font-bold cursor-pointer text-xl text-white hover:bg-[rgba(255,255,255,0.2)] 
              duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signup">Signup</Link>
              </li>
            </>
          )}
        </ul>
  
        {/* Dropdown for Language Selection */}
        <div className="relative z-50">
          <button onClick={toggleDropdown} className="text-white px-4 py-2 rounded-lg">
            <MdLanguage size={25} />
          </button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-28 bg-[rgba(255,255,255,0.2)] backdrop-blur-md border border-[rgba(255,255,255,0.2)]
            rounded-md shadow-lg text-white z-50">
              <li onClick={() => { handleChangeLanguage('fr'); setDropdownOpen(false); }}
                className="cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                Français
              </li>
              <li onClick={() => { handleChangeLanguage('en'); setDropdownOpen(false); }}
                className="cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                English
              </li>
              <li onClick={() => { handleChangeLanguage('nl'); setDropdownOpen(false); }}
                className="cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                Nederlands
              </li>
            </ul>
          )}
        </div>
      </div>
  
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-white focus:outline-none pr-4">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
  
      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute rounded-xl top-[5.5rem] left-0 w-full 
        bg-[rgba(0,0,0,0.8)] backdrop-blur-xl border border-[rgba(255,255,255,0.2)] md:hidden z-50 
        flex flex-col gap-4 px-4 py-2">
          <Link href={`/${lng}`} className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white
          hover:bg-[rgba(255,255,255,0.2)] duration-300 py-2 w-fit text-left">
            {t('title')}
          </Link>
  
          {isSignedIn ? (
            <>
              <Link href={`/${lng}/explore`} className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white 
              hover:bg-[rgba(255,255,255,0.2)] duration-300 py-2 w-fit text-left">
                {t('explore')}
              </Link>
              <Link href={`/${lng}/eventlab`} className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white 
              hover:bg-[rgba(255,255,255,0.2)] duration-300 py-2 w-fit text-left">
                EventLab
              </Link>
              <div className="text-white pl-4">
                <UserButton lng={lng} />
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white 
              hover:bg-[rgba(255,255,255,0.2)] duration-300 py-2 w-fit text-left">
                Signin
              </Link>
              <Link href="/auth/signup" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white 
              hover:bg-[rgba(255,255,255,0.2)] duration-300 py-2 w-fit text-left">
                Signup
              </Link>
            </>
          )}
  
          {/* Language Dropdown for Mobile */}
          <div className="relative z-50">
            <button onClick={toggleDropdown} className="text-white px-4 py-2 rounded-lg">
              <MdLanguage size={25} />
            </button>
            {dropdownOpen && (
              <ul className="absolute left-0 mt-2 w-28 bg-[rgba(255,255,255,0.2)] backdrop-blur-md border border-[rgba(255,255,255,0.2)]
              rounded-md shadow-lg text-white z-50">
                <li onClick={() => { handleChangeLanguage('fr'); setDropdownOpen(false); }}
                  className="cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                  Français
                </li>
                <li onClick={() => { handleChangeLanguage('en'); setDropdownOpen(false); }}
                  className="cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                  English
                </li>
                <li onClick={() => { handleChangeLanguage('nl'); setDropdownOpen(false); }}
                  className="cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                  Nederlands
                </li>
              </ul>
            )}
          </div>
        </div>
      )}
    </nav>

  );  
};

export default Navbar;
