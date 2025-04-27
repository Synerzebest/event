"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import UserButton from "./UserButton";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "../app/i18n";
import { useRouter } from "next/navigation";
import { MdLanguage } from "react-icons/md";
import { safeTranslate } from "@/lib/utils";

interface NavbarProps {
  lng: string;
}

const Navbar = ({ lng }: NavbarProps) => {
  const { isSignedIn } = useAuth();
  const { t, i18n } = useTranslation(lng, ['common']);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const desktopClickedOutside = desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node);
      const mobileClickedOutside = !mobileDropdownRef.current || (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node));
    
      if (desktopClickedOutside && mobileClickedOutside) {
        setDropdownOpen(false);
      }
    }
    
  
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]); 
  
  if (!i18n) {
    return <div>Loading...</div>
  }

  return (
    <nav className="fixed top-0 left-0 w-full bg-white py-4 sm:px-12 px-4 flex justify-between items-center z-[1000]">
      <div>
        <Link href={`/${lng}`}>
          <p className="text-3xl sm:text-4xl text-gray-800 font-extrabold tracking-tight drop-shadow-sm">
            EaseEvent
          </p>
        </Link>
      </div>
  
      <div className="hidden md:flex items-center gap-4"> {/* Desktop Menu */}
        <ul className="flex items-center">
          <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70
          transition-all duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}`}>{safeTranslate(t,'title')}</Link>
          </li>
          <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70
          transition-all duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}/explore`}>{safeTranslate(t,'explore')}</Link>
          </li>
          {isSignedIn ? (
            <>
              <li>
                <Link href={`/${lng}/eventlab`} className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70
                transition-all duration-300 py-2 px-4 rounded-lg">
                  EventLab
                </Link>
              </li>
              <li className="flex items-center">
                <UserButton lng={lng} />
              </li>
            </>
          ) : (
            <>
              <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70
              transition-all duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signin">Signin</Link>
              </li>
              <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70
              transition-all duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signup">Signup</Link>
              </li>
            </>
          )}
        </ul>
  
        {/* Dropdown for Language Selection */}
        <div className="relative z-50" ref={desktopDropdownRef}>
          <button onClick={toggleDropdown} className="text-gray-700 hover:text-indigo-600 transition-all duration-300 p-2 rounded-full">
            <MdLanguage size={25} />
          </button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-32 bg-white/90 backdrop-blur-md border border-gray-200 
            rounded-xl shadow-xl text-gray-800">
              <li onClick={() => { handleChangeLanguage('fr'); setDropdownOpen(false); }}
                className="cursor-pointer px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all">
                Français
              </li>
              <li onClick={() => { handleChangeLanguage('en'); setDropdownOpen(false); }}
                className="cursor-pointer px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all">
                English
              </li>
              <li onClick={() => { handleChangeLanguage('nl'); setDropdownOpen(false); }}
                className="cursor-pointer px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all">
                Nederlands
              </li>
            </ul>
          )}
        </div>
      </div>
  
      <div className="md:hidden">
        <button onClick={toggleMenu} className="text-gray-700 focus:outline-none pr-4">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>
  
      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-[5.5rem] left-0 w-full bg-white backdrop-blur-md md:hidden z-40 flex flex-col gap-4 px-6 py-6 rounded-b-2xl shadow-md">
          <Link href={`/${lng}`} className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            {safeTranslate(t,'title')}
          </Link>
  
          {isSignedIn ? (
            <>
              <Link href={`/${lng}/explore`} className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                {safeTranslate(t,'explore')}
              </Link>
              <Link href={`/${lng}/eventlab`} className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                EventLab
              </Link>
              <div className="text-white pl-4">
                <UserButton lng={lng} />
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                Signin
              </Link>
              <Link href="/auth/signup" className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                Signup
              </Link>
            </>
          )}
  
          {/* Language Dropdown for Mobile */}
          <div className="relative z-50" ref={mobileDropdownRef}>
            <button onClick={toggleDropdown} className="text-gray-800 px-4 py-2 rounded-lg">
              <MdLanguage size={25} />
            </button>
            {dropdownOpen && (
              <ul className="absolute left-0 mt-4 w-32 bg-white/90 backdrop-blur-md border border-gray-200 
              rounded-xl shadow-xl text-gray-800">
                <li onClick={() => { handleChangeLanguage('fr'); setDropdownOpen(false); }}
                  className="font-bold cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                  Français
                </li>
                <li onClick={() => { handleChangeLanguage('en'); setDropdownOpen(false); }}
                  className="font-bold cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
                  English
                </li>
                <li onClick={() => { handleChangeLanguage('nl'); setDropdownOpen(false); }}
                  className="font-bold cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]">
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
