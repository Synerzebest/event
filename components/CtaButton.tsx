"use client"

import React from 'react';
import Link from 'next/link';
import { useTranslation } from "../app/i18n";
import useLanguage from '@/lib/useLanguage';
import { FaRegCalendarCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { safeTranslate } from "@/lib/utils";

const CtaButton = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

    return (
        <Link href={`/${lng}/eventlab`} className="fixed bottom-4 right-4 z-20">
            <button className="flex items-center gap-2 text-sm text-white bg-gray-900 hover:bg-950 duration-300 py-2 px-2 font-bold rounded-xl border border-gray-500">
                {safeTranslate(t,'cta_button')}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, -10, 10, -5, 5, 0],
                    }}
                    transition={{
                        repeat: Infinity, 
                        repeatDelay: 5, 
                        duration: 1,
                        ease: "easeInOut",
                    }}
                >
                    <FaRegCalendarCheck size={15} />
                </motion.div>
            </button>
        </Link>
    )
}

export default CtaButton;
