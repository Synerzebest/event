"use client"

import React from 'react';
import Link from 'next/link';
import { Button } from "antd";
import { useTranslation } from "../app/i18n";
import useLanguage from '@/lib/useLanguage';
import { FaRegCalendarCheck } from "react-icons/fa";
import { motion } from "framer-motion";

const CtaButton = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

    return (
        <Link href={`/${lng}/eventlab`} className="fixed bottom-4 right-4 z-20">
            <Button type="primary" size="large" className="flex items-center shadow-xl font-bold hover:scale-105 transition-transform duration-200">
                {t('cta_button')}
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
                    <FaRegCalendarCheck />
                </motion.div>
            </Button>
        </Link>
    )
}

export default CtaButton;
