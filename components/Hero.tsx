import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const heroImage = "/images/hero.png";

interface HeroProps {
    heroTitle: string;
    heroSubtitle: string;
    heroButton: string;
}

const Hero = ({ heroTitle, heroSubtitle, heroButton } : HeroProps) => {
    return (
        <div className="relative top-24 h-[550px] w-full h-auto flex flex-col lg:flex-row items-center justify-center">

            <div className="z-2 text-center p-4 sm:p-8 lg:w-1/2 lg:text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                    {heroTitle}
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl">
                    {heroSubtitle}
                </p>
                <Link href="/explore">
                    <button className="text-xl text-white bg-blue-500 border-none mt-8 py-4 px-6 font-bold rounded-xl hover:bg-blue-600 duration-300">
                        {heroButton}
                    </button>
                </Link>
            </div>

            <div className="relative w-full lg:w-[30%] h-[350px] z-10">
                <Image
                    src={heroImage}
                    alt="hero image designed by freepik"
                    fill
                    style={{ objectFit: 'contain' }}
                    className="opacity-90"
                />
            </div>
        </div>
    );
}

export default Hero;
