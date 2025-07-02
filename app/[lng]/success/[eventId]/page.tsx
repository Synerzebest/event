'use client';

import { useState, useEffect, Suspense } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import { Navbar, EventComponent, Footer } from '@/components';
import { useParams } from 'next/navigation';
import useFirebaseUser from '@/lib/useFirebaseUser';
import { useTranslation } from '../../../i18n';
import { safeTranslate } from '@/lib/utils';
import Link from "next/link";

const Page = () => {
  const [showConfetti] = useState(true);
  const [confettiCount] = useState(200);
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 });
  const { lng, eventId } = useParams() as { lng: string; eventId: string };
  const { user } = useFirebaseUser();
  const userId = user?.uid;
  const { t } = useTranslation(lng, 'common');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
  }, []);

  return (
    <Suspense>
      <Navbar lng={lng} />

      {/* SVG Decorative Backgrounds */}
      <div className="absolute -top-32 -left-32 z-0">
        <svg className="w-[400px] h-[350px] overflow-visible" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
          </defs>
          <circle cx="200" cy="200" r="200" fill="#6366f1" fillOpacity="0.2" filter="url(#blur1)" />
        </svg>
      </div>

      <div className="absolute top-60 right-[-6rem] z-0">
        <svg className="w-[300px] h-[300px] overflow-visible" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="60" />
            </filter>
          </defs>
          <circle cx="200" cy="200" r="200" fill="#ec4899" fillOpacity="0.2" filter="url(#blur2)" />
        </svg>
      </div>

      <div className="absolute bottom-[-10rem] left-1/2 -translate-x-1/2 z-0">
        <svg className="w-[400px] h-[400px] overflow-visible" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur3" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="120" />
            </filter>
          </defs>
          <circle cx="250" cy="250" r="250" fill="#a855f7" fillOpacity="0.25" filter="url(#blur3)" />
        </svg>
      </div>

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

      <motion.div
        className="w-[95%] sm:w-11/12 max-w-3xl bg-white/80 backdrop-blur-md border border-indigo-200 shadow-xl relative top-36 mx-auto p-10 rounded-2xl z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-500 text-white w-16 h-16 flex items-center justify-center text-3xl rounded-full shadow-md">
            🎊
          </div>
        </div>

        <motion.h1
          className="text-4xl font-extrabold text-indigo-700 text-center tracking-wide"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {safeTranslate(t, 'success_message')}
        </motion.h1>

        <motion.p
          className="mt-6 text-lg font-medium text-gray-700 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {safeTranslate(t, 'success_submessage')}
        </motion.p>

        <Link href={`/${lng}/eventlab`}>
            <motion.p
                className="text-sm font-medium text-blue-500 underline text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {safeTranslate(t, "eventlab_link")}
            </motion.p>
        </Link>

        <motion.div
          className="mt-6 bg-white rounded-lg flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          <EventComponent eventId={eventId} userId={userId} participateButton={false} />
        </motion.div>

        <motion.p
            className="mt-6 text-sm font-bold text-gray-800 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
        >
            {safeTranslate(t, "trust")}
        </motion.p>
      </motion.div>

      <Footer />
    </Suspense>
  );
};

export default Page;
