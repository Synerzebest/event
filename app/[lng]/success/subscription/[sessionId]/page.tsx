"use client"

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components';
import { useParams } from 'next/navigation';
import { useTranslation } from '../../../../i18n';

const Page = () => {
    const [showConfetti] = useState(true);
    const [confettiCount] = useState(200);
    const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
    const { lng } = useParams() as { lng: string };
    const { t } = useTranslation(lng, "common");

    // On s'assure que le code qui dépend de `window` est exécuté uniquement côté client
    useEffect(() => {
        if (typeof window !== "undefined") {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        }
    }, []);

    return (
        <>
            <Navbar lng={lng} />
            
            <motion.div
                className="w-11/12 h-[500px] flex flex-col justify-evenly relative top-12 mx-auto p-8 rounded-xl bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 shadow-lg"
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Confetti */}
                {showConfetti && windowDimensions.width && windowDimensions.height && (
                    <Confetti 
                        numberOfPieces={confettiCount} 
                        recycle={false} 
                        gravity={0.1}
                        width={windowDimensions.width}
                        height={windowDimensions.height}
                    />
                )}

                {/* Boutons en haut */}
                <motion.div
                    className="absolute top-6 left-1/2 transform -translate-x-1/2 flex justify-between w-10/12"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                </motion.div>

                <motion.h1
                    className="text-4xl font-extrabold text-white text-center tracking-wide text-4xl"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    🎉 {t('success_message')}
                </motion.h1>
                
                <motion.p
                    className="mt-6 text-white font-medium text-center text-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    {t('subscription_success_submessage')}
                </motion.p>
                <motion.p
                    className="mt-6 text-white font-medium text-center text-2xl"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    {t('subscription_tip')}
                </motion.p>
            </motion.div>
            <Footer />
        </>
    );
};

export default Page;
