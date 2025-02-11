"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FaUser } from "react-icons/fa";
import { format } from "date-fns";
import { notification } from 'antd';
import { FaShare } from "react-icons/fa6";
import { LuCalendarDays } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Event } from "@/types/types"; 
import { useTranslation } from "app/i18n"
import useLanguage from "@/lib/useLanguage";
import { Spin } from "antd";
import useFirebaseUser from "@/lib/useFirebaseUser";
import Link from "next/link";

interface EventComponentProps {
    eventId: string,
    userId?: string,
    participateButton: boolean,
}

const EventComponent: React.FC<EventComponentProps> = ({ eventId, userId, participateButton }) => {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<Event>();
    const [menuOpen, setMenuOpen] = useState(false); 
    const menuRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const lng = useLanguage();
    const { t } = useTranslation(lng, 'common');
    const { user } = useFirebaseUser();

    useEffect(() => {
        const fetchEvent = async () => {
            if (!eventId) return;

            try {
                const response = await fetch(`/api/getEventById/${eventId}`);
                const data = await response.json();

                if (response.ok) {
                    setEvent(data);
                } else {
                    console.error("Event not found or error in response:", data.error);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    const handleCopyLink = (eventId: string) => {
        const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/event/${eventId}`;
        navigator.clipboard.writeText(eventUrl);
        notification.success({
            message: "Link Copied!",
            description: "Event link has been copied to clipboard.",
            placement: "topRight",
        });
    };

    const handleParticipateClick = async () => {
        setIsSubmitting(true);
        try {
            if (userId) {
                await new Promise((resolve) => setTimeout(resolve, 500));
                await router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${eventId}/participate`);
            } else {
                router.push('/auth/signin');
            }
        } catch (error) {
            console.error("Error during participation:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // On vérifie si l'événement est chargé avant d'afficher les informations
    if (loading || !event) {
        return (
            <div className="flex-1 min-w-[300px] max-w-[350px] rounded-lg overflow-hidden shadow-lg bg-white">
                {/* Afficher un squelette ou placeholder en attendant */}
                <div className="h-[200px] bg-gray-300 animate-pulse"></div>
                <div className="p-4">
                    <div className="w-full h-6 bg-gray-300 animate-pulse mb-2"></div>
                    <div className="w-2/3 h-4 bg-gray-300 animate-pulse mb-2"></div>
                    <div className="w-1/2 h-4 bg-gray-300 animate-pulse"></div>
                </div>
            </div>
        );
    }

    const eventDate = new Date(event.date);
    const isPastEvent = eventDate < new Date();
    const formattedDate = format(eventDate, 'dd MMMM yyyy');

    return (
        <motion.div 
            className="relative flex-1 min-w-[320px] max-w-[350px] rounded-xl shadow-xl bg-white"
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {menuOpen && (
                <motion.div 
                    ref={menuRef}
                    className="absolute top-[-3rem] z-[100] right-2 bg-white border rounded-lg shadow-lg p-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <button
                        className="text-gray-800 text-sm px-4 py-2 hover:bg-gray-100 w-full text-left"
                        onClick={() => handleCopyLink(event.id)}
                    >
                        {t('copy_event_link')}
                    </button>
                </motion.div>
            )}

            <Image
                src={event.images[0]}
                alt={event.title}
                width={350}
                height={200}
                className="object-cover w-full h-auto max-h-[250px] mx-auto border-0 border-b rounded-t-xl"
            />

            <button
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-20 focus:outline-none duration-300"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <FaShare className="w-4 h-4 text-white" />
            </button>

            <div className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-all">{event.title}</h3>
                    <div className="border border-blue-700 text-blue-700 text-sm font-bold py-1 px-2 rounded flex items-center gap-1 whitespace-nowrap">
                        {event.currentGuests !== undefined ? event.currentGuests : 0} / {event.guestLimit} <FaUser />
                    </div>
                </div>
                <p className="text-gray-600 text-start flex items-center"><LuCalendarDays className="mr-2" /> {formattedDate}</p>
                <p className="text-gray-600 text-start flex items-center"><IoLocationOutline className="mr-2" /> {event.place}</p>
                <p className="text-gray-700 mt-2 text-sm">{event.description}</p>

                {participateButton && (
                    <div className="flex gap-4 mt-4">
                    {!user ? (
                        isPastEvent ? (
                            <motion.button
                                className="font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2 bg-gray-200 text-gray-500 cursor-not-allowed"
                                disabled
                            >
                                {t('event_expired')}
                            </motion.button>
                        ) : (
                            <Link href={`/${lng}/auth/signin`}>
                                <motion.button
                                    className="font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-800"
                                >
                                    {t('login_to_participate')}
                                </motion.button>
                            </Link>
                        )
                    ) : (
                        <motion.button
                            className={`font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2
                                ${isSubmitting || isPastEvent ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-800"}
                            `}
                            onClick={handleParticipateClick}
                            disabled={isSubmitting || isPastEvent} 
                        >
                            {isSubmitting ? (
                                <>
                                    {t('participate')} <Spin size="small" />
                                </>
                            ) : (
                                isPastEvent ? t('event_expired') : t('participate')
                            )}
                        </motion.button>
                    )}
                </div>
                )}
            </div>
        </motion.div>
    );
};

export default EventComponent;
