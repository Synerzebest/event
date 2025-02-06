import React from 'react';
import Link from 'next/link';
import { Button } from "antd";
import { useTranslation } from "../app/i18n";
import useLanguage from '@/lib/useLanguage';
import { FaRegCalendarCheck } from "react-icons/fa";

const CtaButton = () => {
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

    return (
        <Link href={`/${lng}/eventlab`} className="fixed bottom-4 right-4 z-20">
            <Button type="primary" size="large" className="flex items-center shadow-xl font-bold hover:scale-105 transition-transform duration-200">
                {t('cta_button')}
                <FaRegCalendarCheck />
            </Button>
        </Link>
    )
}

export default CtaButton;
