"use client";

import { useEffect, useState } from "react";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";


// Fonction pour calculer le temps restant jusqu'à la date de l'événement
const calculateTimeLeft = (eventDate: string) => {
    const difference = new Date(eventDate).getTime() - new Date().getTime();

    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

const Countdown = ({ eventDate }: { eventDate: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(eventDate));
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(eventDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [eventDate]);

    return (
        <div className="relative top-12 flex items-center justify-center p-4 rounded-xl mb-12">
            {timeLeft.days > 0 ? (
                <div className="flex items-center gap-3 sm:gap-4 text-gray-800">
                {[
                    { value: timeLeft.days, label: safeTranslate(t, "days") },
                    { value: timeLeft.hours, label: safeTranslate(t, "hours") },
                    { value: timeLeft.minutes, label: safeTranslate(t, "minutes") },
                    { value: timeLeft.seconds, label: safeTranslate(t, "seconds") }
                ].map(({ value, label }, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <div className="min-w-[48px] px-3 py-2 bg-white rounded-xl shadow-sm border border-gray-200 text-2xl sm:text-3xl font-semibold">
                            {String(value).padStart(2, '0')}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 uppercase tracking-wide">
                            {label}
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-800">
                        {safeTranslate(t, 'event_happening')}
                    </h3>
                </div>
            )}
        </div>
    
    );
};

export default Countdown;
