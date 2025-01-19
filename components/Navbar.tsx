"use client";

import React, { useState } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import UserButton from "./UserButton";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "../app/i18n";
import { useRouter, usePathname } from "next/navigation";
import { MdLanguage } from "react-icons/md";

interface NavbarProps {
  lng: string;
}

const Navbar = ({ lng }: NavbarProps) => {
  const { isSignedIn, loading } = useAuth();
  const { t, i18n } = useTranslation(lng, ['common']);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!i18n) {
    return <div>Loading...</div>
  }

  const handleChangeLanguage = (newLng: string) => {
    if (pathname && i18n) {
      // Assurez-vous que l'URL commence par une langue
      const newPath = pathname.replace(/^\/(en|fr|nl)/, `/${newLng}`);
      i18n.changeLanguage(newLng); // Change la langue dans i18n
      router.push(newPath); // Redirige vers la nouvelle URL
    }
  };
  

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="w-[98%] rounded-xl mx-auto mt-2 flex justify-between items-center py-2 sm:px-12 px-4 bg-blue-500 z-10">
      <div>
        <Link href={`/${lng}`}>
          <p className="text-4xl text-white px-4 py-2 rounded-xl font-bold">EventEase</p>
        </Link>
      </div>

      <div className="hidden md:flex items-center gap-4"> {/* Desktop Menu */}
        <ul className="flex gap-4 items-center">
          <li className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}`}>{t('title')}</Link>
          </li>
          <li className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}/explore`}>{t('explore')}</Link>
          </li>
          {isSignedIn ? (
            <>
              <li>
                <Link
                  href={`/${lng}/eventlab`}
                  className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg"
                >
                  EventLab
                </Link>
              </li>
              <li className="flex items-center">
                <UserButton lng={lng} />
              </li>
            </>
          ) : (
            <>
              <li className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signin">Signin</Link>
              </li>
              <li className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signup">Signup</Link>
              </li>
            </>
          )}
        </ul>

        {/* Dropdown for Language Selection */}
        <div className="relative z-10">
          <button
            onClick={toggleDropdown}
            className="text-white px-4 py-2 rounded-lg"
          >
            <MdLanguage size={25} />
          </button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-lg text-gray-700">
              <li
                onClick={() => {
                  handleChangeLanguage("fr");
                  setDropdownOpen(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              >
                Français
              </li>
              <li
                onClick={() => {
                  handleChangeLanguage("en");
                  setDropdownOpen(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              >
                English
              </li>
              <li
                onClick={() => {
                  handleChangeLanguage("nl");
                  setDropdownOpen(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-gray-200"
              >
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
        <div className="absolute rounded-xl top-[5.5rem] left-1/2 transform -translate-x-1/2 w-[98%] bg-blue-500 md:hidden z-10 flex flex-col gap-4 px-4 py-2">
          <Link
            href={`/${lng}`}
            className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left"
          >
            {t('title')}
          </Link>

          {isSignedIn ? (
            <>
              <Link
                href={`/${lng}/explore`}
                className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left"
              >
                {t('explore')}
              </Link>
              <Link
                href={`/${lng}/eventlab`}
                className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left"
              >
                EventLab
              </Link>
              <div className="text-white pl-4">
                <UserButton lng={lng} />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left"
              >
                Signin
              </Link>
              <Link
                href="/sign-up"
                className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left"
              >
                Signup
              </Link>
            </>
          )}
          <div className="flex items-center">
            <button onClick={() => handleChangeLanguage("en")} className="text-white px-4 py-2">
              EN
            </button>
            <button onClick={() => handleChangeLanguage("fr")} className="text-white px-4 py-2">
              FR
            </button>
            <button onClick={() => handleChangeLanguage("nl")} className="text-white px-4 py-2">
              NL
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
