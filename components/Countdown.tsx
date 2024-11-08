"use client";

import { useEffect, useState } from "react";

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

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(eventDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [eventDate]);

    return (
        <div className="relative top-12 flex items-center justify-center p-4 rounded-lg">
            {timeLeft.days > 0 ? (
                <div className="text-center">
                    <h3 className="text-3xl font-semibold">Event starts in:</h3>
                    <div className="flex space-x-4 mt-2 text-gray-600">
                        <div className="flex flex-col">
                            <span className="text-4xl font-semibold">{timeLeft.days}</span>
                            <span className="text-xs uppercase">Days</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-4xl font-semibold">{timeLeft.hours}</span>
                            <span className="text-xs uppercase">Hours</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-4xl font-semibold">{timeLeft.minutes}</span>
                            <span className="text-xs uppercase">Minutes</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-4xl font-semibold">{timeLeft.seconds}</span>
                            <span className="text-xs uppercase">Seconds</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-800">Event is happening now!</h3>
                </div>
            )}
        </div>

    );
};

export default Countdown;
