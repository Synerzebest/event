"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { FaShare } from "react-icons/fa6";
import { IoCalendarNumberSharp } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Event } from "@/types/types"; 
import { useTranslation } from "app/i18n"
import useLanguage from "@/lib/useLanguage";
import { Spin } from "antd";
import useFirebaseUser from "@/lib/useFirebaseUser";
import Link from "next/link";
import { safeTranslate } from "@/lib/utils";
import { HiUserGroup } from "react-icons/hi2";
import ShareModal from "./ShareModal";
import AnimatedLikeButton from "./ui/animated-like-button";
import { FaMapLocationDot } from "react-icons/fa6";

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
    const [isLiked, setIsLiked] = useState(false);
    const [shareModalEvent, setShareModalEvent] = useState<Event | null>(null);

    const handleLike = async (eventId: string) => {
        if (!user) {
            router.push('/auth/signin');
            return;
        } 
        setIsLiked(prev => !prev);
        try {
            const response = await fetch('/api/likeEvent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, eventId }),
            });
    
            if (!response.ok) {
                setIsLiked(prev => !prev);
            }
        } catch (error) {
            setIsLiked(prev => !prev);
            console.error(error);
        }
    };    

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
        const checkIfLiked = async () => {
            if (!user || !eventId) return;
    
            try {
                const response = await fetch(`/api/users/${userId}`);
                const data = await response.json();
    
                if (response.ok && data.likedEvents) {
                    setIsLiked(data.likedEvents.includes(eventId));
                }
            } catch (err) {
                console.error('Error fetching liked events:', err);
            }
        };
    
        checkIfLiked();
    }, [user, eventId]);    

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
            <div className="w-full flex justify-center px-4">
                <div className="w-full max-w-[350px] rounded-lg overflow-hidden shadow-lg bg-white border-t border-b border-gray-200 sm:border sm:rounded-xl">
                    {/* Image placeholder */}
                    <div className="h-[200px] bg-gray-300 animate-pulse"></div>
    
                    {/* Texte placeholder */}
                    <div className="p-4">
                        <div className="w-full h-6 bg-gray-300 animate-pulse mb-2"></div>
                        <div className="w-2/3 h-4 bg-gray-300 animate-pulse mb-2"></div>
                        <div className="w-1/2 h-4 bg-gray-300 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }
    

    const eventDate = new Date(event.date);
    const isPastEvent = eventDate < new Date();
    const formattedDate = format(eventDate, 'dd MMMM yyyy');

    return (
        <motion.div 
            className="relative flex-1 w-full sm:min-w-[320px] sm:max-w-[350px] bg-white border-l-0 border-r-0 border-t border-b sm:border border-gray-200 shadow-sm overflow-hidden rounded-none sm:rounded-md"
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* --- BARRE SUPÉRIEURE (titre + bouton share) --- */}
            <div className="flex justify-between items-center px-4 py-3 bg-white/80">
                <h3 className="font-semibold text-lg text-gray-800 truncate">{event.title}</h3>
                <button
                    className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200"
                    onClick={() => setShareModalEvent(event)}
                >
                    <FaShare className="w-4 h-4 text-indigo-500" />
                </button>
            </div>
    
            {/* --- IMAGE --- */}
            <div className="relative">
                <Image
                    src={event.images[0]}
                    alt={event.title}
                    width={350}
                    height={250}
                    className="object-cover w-full h-[250px] max-h-[250px] border-0"
                />
            </div>
    
            {/* --- CONTENU --- */}
            <div className="p-4 flex flex-col justify-between">
                <div className="flex flew-row-reverse justify-between items-start">
                    {/* Détails */}
                    <div className="flex flex-col gap-2">
                        <p className="text-gray-600 text-start flex items-center">
                            <IoCalendarNumberSharp className="text-indigo-500 mr-2 w-5 h-5" /> {formattedDate}
                        </p>
                        <p className="text-gray-600 text-start flex items-center">
                            <FaMapLocationDot className="text-indigo-500 mr-2 w-5 h-5" /> {event.place} - {event.city}
                        </p>
                        <p className="text-gray-700 mt-2 text-sm">{event.description}</p>
                    </div>

                    {/* Nombre d’invités */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="bg-indigo-500 text-white text-sm font-bold py-[0.35rem] px-3 rounded flex items-center gap-1 whitespace-nowrap">
                            {event.currentGuests ?? 0} / {event.guestLimit}
                            <HiUserGroup className="text-white w-5 h-5" />
                        </div>
                    </div>
                </div>
    
                {/* Boutons de participation */}
                {participateButton && (
                    <div className="flex gap-4 mt-4">
                        {!user ? (
                            isPastEvent ? (
                                <motion.button
                                    className="font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2 bg-gray-200 text-gray-500 cursor-not-allowed"
                                    disabled
                                >
                                    {safeTranslate(t, 'event_expired')}
                                </motion.button>
                            ) : (
                                <Link href={`/${lng}/auth/signin`}>
                                    <motion.button
                                        className="font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-800"
                                    >
                                        {safeTranslate(t, 'login_to_participate')}
                                    </motion.button>
                                </Link>
                            )
                        ) : (
                            <div className="w-full flex items-center justify-between">
                                <motion.button
                                    className={`font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2
                                        ${isSubmitting || isPastEvent ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-indigo-500 text-white hover:bg-indigo-800"}
                                    `}
                                    onClick={handleParticipateClick}
                                    disabled={isSubmitting || isPastEvent}
                                >
                                    {isSubmitting ? (
                                        <>
                                            {safeTranslate(t, 'participate')} <Spin size="small" />
                                        </>
                                    ) : (
                                        isPastEvent ? safeTranslate(t, 'event_expired') : safeTranslate(t, 'participate')
                                    )}
                                </motion.button>
    
                                <AnimatedLikeButton liked={isLiked} onToggle={() => handleLike(event.id)} />
                            </div>
                        )}
                    </div>
                )}
            </div>
    
            {shareModalEvent && (
                <ShareModal
                    open={true}
                    onClose={() => setShareModalEvent(null)}
                    eventUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/event/${shareModalEvent.id}`}
                    eventTitle={shareModalEvent.title}
                />
            )}
        </motion.div>
    );     
};

export default EventComponent;
