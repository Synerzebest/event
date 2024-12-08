"use client";

import React, { useState } from "react";
import Link from "next/link";
import useAuth from "@/lib/useAuth";
import UserButton from "./UserButton";
import { FaBars, FaTimes } from "react-icons/fa"; // Import des icônes

const Navbar = () => {
  const { isSignedIn, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // État pour gérer l'ouverture/fermeture du menu

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="w-[98%] rounded-xl mx-auto mt-2 flex justify-between items-center py-2 sm:px-12 px-4 bg-blue-500 z-10">
        <div>
            <Link href="/">
                <p className="text-4xl text-white px-4 py-2 rounded-xl font-bold">EventEase</p>
            </Link>
        </div>

        <div className="hidden md:flex"> {/* Menu desktop */}
            <ul className="flex gap-4 items-center">
                <li className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
                    <Link href="/">Home</Link>
                </li>
                <li className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
                    <Link href="/explore">Explore</Link>
                </li>
            {isSignedIn ? (
                <>
                    <li>
                        <Link href="/eventlab" className="font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 px-4 rounded-lg">
                            EventLab
                        </Link>
                    </li>
                    <li>
                        <UserButton />
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
        </div>

        <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white focus:outline-none pr-4">
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />} {/* Affiche un X quand le menu est ouvert */}
            </button>
        </div>

        {/* Menu déroulant pour mobile */}
        {isOpen && (
            <div className="absolute rounded-xl top-[5.5rem] left-1/2 transform -translate-x-1/2 w-[98%] bg-blue-500 md:hidden z-10 flex flex-col gap-4 px-4 py-2">

                <Link href="/" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left">
                    Home
                </Link>

                {isSignedIn ? (
                    <>
                        <Link href="/explore" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left">
                            Explore
                        </Link>
                        <Link href="/eventlab" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left">
                            EventLab
                        </Link>
                        <div className="text-white pl-4">
                            <UserButton />
                        </div>
                    </>
                ) : (
                    <>
                        <Link href="/sign-in" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left">
                            Signin
                        </Link>
                        <Link href="/sign-up" className="px-4 rounded-lg font-bold cursor-pointer text-xl text-white hover:bg-blue-600 duration-300 py-2 w-fit text-left">
                            Signup
                        </Link>
                    </>
                )}
            </div>
        )}
    </nav>
  );
};

export default Navbar;
