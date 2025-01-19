import React from 'react';
import Image from "next/image";
import { useTranslation } from "../app/i18n";

const backup = "/images/backup.png";
const security = "/images/security.png";
const support = "/images/support.png";

const ReliabilitySection = ({ lng }: { lng: "en" | "fr" | "nl" }) => {
    const { t } = useTranslation(lng, "common");
    return (
        <section className="py-16 bg-gray-50 relative top-64">
            <div className="container mx-auto">
                {/* Title */}
                <h2 className="text-4xl font-bold text-center mb-8">{t('security_title')}</h2>
                <p className="text-center text-lg text-gray-600 mb-12">
                    {t('security_subtitle')}
                </p>
                
                {/* Feature Cards */}
                <div className="flex flex-wrap justify-center gap-8">
                    {/* Card 1 */}
                    <div className="w-full sm:w-1/3 flex flex-col items-center text-center">
                        <Image 
                            src={security} 
                            alt="Data protection image" 
                            width={100} 
                            height={100} 
                            objectFit="contain" 
                            className="mb-4"
                        />
                        <h3 className="text-2xl font-bold">{t('data_title')}</h3>
                        <p className="text-gray-600 mt-2 mx-4">
                            {t('data_subtitle')}
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="w-full sm:w-1/3 flex flex-col items-center text-center">
                        <Image 
                            src={backup} 
                            alt="backup image" 
                            width={100} 
                            height={100} 
                            objectFit="contain" 
                            className="mb-4"
                        />
                        <h3 className="text-2xl font-bold">{t('backups_title')}</h3>
                        <p className="text-gray-600 mt-2 mx-4">
                            {t('backups_subtitle')}
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="w-full sm:w-1/3 flex flex-col items-center text-center">
                        <Image 
                            src={support} 
                            alt="Support image" 
                            width={100} 
                            height={100} 
                            objectFit="contain" 
                            className="mb-4"
                        />
                        <h3 className="text-2xl font-bold">{t('support_title')}</h3>
                        <p className="text-gray-600 mt-2 mx-4">
                            {t('support_subtitle')}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ReliabilitySection;
