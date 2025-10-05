"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import UserButton from "./UserButton";
import { FaBars, FaTimes } from "react-icons/fa";
import { useTranslation } from "../app/i18n";
import { useRouter } from "next/navigation";
import { MdLanguage } from "react-icons/md";
import { safeTranslate } from "@/lib/utils";

interface NavbarProps {
  lng: string;
}

const Navbar = ({ lng }: NavbarProps) => {
  const { isSignedIn } = useAuth();
  const { t, i18n } = useTranslation(lng, ["common"]);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const desktopDropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null); // ref bouton mobile

  const handleChangeLanguage = (newLng: string) => {
    if (i18n) {
      i18n.changeLanguage(newLng);
      const currentPath = window.location.pathname;
      const newPath = currentPath.replace(/^\/(en|fr|nl)/, `/${newLng}`);
      router.push(newPath);
    }
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Vérifie si le clic vient du bouton menu -> on ignore
      if (menuButtonRef.current?.contains(target)) return;

      const dropdownRefs = [desktopDropdownRef.current, mobileDropdownRef.current].filter(
        (r): r is HTMLDivElement => Boolean(r)
      );

      const clickedOutsideAllDropdowns = dropdownRefs.every((ref) => !ref.contains(target));

      if (dropdownOpen && clickedOutsideAllDropdowns) {
        setDropdownOpen(false);
      }

      if (isOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleClickOutside, true);
    return () => document.removeEventListener("pointerdown", handleClickOutside, true);
  }, [dropdownOpen, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!i18n) {
    return <div>Loading...</div>;
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

      {/* Menu desktop */}
      <div className="hidden md:flex items-center gap-4">
        <ul className="flex items-center">
          <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70 transition-all duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}`}>{safeTranslate(t, "title")}</Link>
          </li>
          <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70 transition-all duration-300 py-2 px-4 rounded-lg">
            <Link href={`/${lng}/explore`}>{safeTranslate(t, "explore")}</Link>
          </li>
          {isSignedIn ? (
            <>
              <li>
                <Link
                  href={`/${lng}/eventlab`}
                  className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70 transition-all duration-300 py-2 px-4 rounded-lg"
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
              <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70 transition-all duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signin">{safeTranslate(t, "signin")}</Link>
              </li>
              <li className="font-smibold cursor-pointer text-lg text-gray-700 hover:text-indigo-700 hover:bg-white/70 transition-all duration-300 py-2 px-4 rounded-lg">
                <Link href="/auth/signup">{safeTranslate(t, "signup")}</Link>
              </li>
            </>
          )}
        </ul>

        {/* Dropdown langue (desktop) */}
        <div className="relative z-50" ref={desktopDropdownRef}>
          <button
            onClick={toggleDropdown}
            className="text-gray-700 hover:text-indigo-600 transition-all duration-300 p-2 rounded-full"
          >
            <MdLanguage size={25} />
          </button>
          {dropdownOpen && (
            <ul className="absolute right-0 mt-2 w-32 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl text-gray-800">
              <li
                onClick={() => {
                  handleChangeLanguage("fr");
                  setDropdownOpen(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all"
              >
                Français
              </li>
              <li
                onClick={() => {
                  handleChangeLanguage("en");
                  setDropdownOpen(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all"
              >
                English
              </li>
              <li
                onClick={() => {
                  handleChangeLanguage("nl");
                  setDropdownOpen(false);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all"
              >
                Nederlands
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Bouton mobile */}
      <div className="md:hidden">
        <button
          ref={menuButtonRef}
          onClick={toggleMenu}
          className="text-gray-700 focus:outline-none pr-4"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Menu mobile */}
      {isOpen && (
        <div
          ref={mobileMenuRef}
          className="absolute top-[3.5rem] left-0 w-full bg-white backdrop-blur-md md:hidden flex flex-col gap-4 px-6 py-6 rounded-b-2xl z-[1000]"
        >
          <Link
            href={`/${lng}`}
            className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            {safeTranslate(t, "title")}
          </Link>

          {isSignedIn ? (
            <>
              <Link
                href={`/${lng}/explore`}
                className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {safeTranslate(t, "explore")}
              </Link>
              <Link
                href={`/${lng}/eventlab`}
                className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
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
                href="/auth/signin"
                className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {safeTranslate(t, "signin")}
              </Link>
              <Link
                href="/auth/signup"
                className="block w-full text-gray-800 font-semibold text-lg py-3 px-4 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"
              >
                {safeTranslate(t, "signup")}
              </Link>
            </>
          )}

          {/* Dropdown langue (mobile) */}
          <div className="relative z-10 w-fit" ref={mobileDropdownRef}>
            <button onClick={toggleDropdown} className="text-gray-800 px-4 py-2 rounded-lg">
              <MdLanguage size={25} />
            </button>
            {dropdownOpen && (
              <ul className="absolute left-0 mt-4 w-32 bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl text-gray-800">
                <li
                  onClick={() => {
                    handleChangeLanguage("fr");
                    setDropdownOpen(false);
                  }}
                  className="font-bold cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]"
                >
                  Français
                </li>
                <li
                  onClick={() => {
                    handleChangeLanguage("en");
                    setDropdownOpen(false);
                  }}
                  className="font-bold cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]"
                >
                  English
                </li>
                <li
                  onClick={() => {
                    handleChangeLanguage("nl");
                    setDropdownOpen(false);
                  }}
                  className="font-bold cursor-pointer px-4 py-2 hover:bg-[rgba(255,255,255,0.3)]"
                >
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
