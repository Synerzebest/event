"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { format } from "date-fns";
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
import { safeTranslate } from "@/lib/utils";
import { FaUser } from "react-icons/fa";
import ShareModal from "./ShareModal";
import AnimatedLikeButton from "./ui/animated-like-button";

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
            className="relative flex-1 min-w-[320px] max-w-[350px] rounded-xl shadow-md bg-white"
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <Image
                src={event.images[0]}
                alt={event.title}
                width={350}
                height={250}
                className="object-cover w-full h-[250px] max-h-[250px] mx-auto border-0 border-b rounded-t-xl"
            />

            <button
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-20 focus:outline-none duration-300"
                onClick={() => setShareModalEvent(event)}
            >
                <FaShare className="w-4 h-4 text-white" />
            </button>

            <div className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-xl text-gray-800 hover:text-indigo-600 transition-all">{event.title}</h3>
                    <div className="border border-indigo-700 text-indigo-700 text-sm font-bold py-1 px-2 rounded flex items-center gap-1 whitespace-nowrap">
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
                                {safeTranslate(t,'event_expired')}
                            </motion.button>
                        ) : (
                            <Link href={`/${lng}/auth/signin`}>
                                <motion.button
                                    className="font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2 bg-indigo-600 text-white hover:bg-indigo-800"
                                >
                                    {safeTranslate(t,'login_to_participate')}
                                </motion.button>
                            </Link>
                        )
                    ) : (
                        <div className="w-full flex items-center justify-between">
                            <motion.button
                                className={`font-bold py-2 px-4 rounded-lg transition-all duration-200 transform flex items-center justify-center gap-2
                                    ${isSubmitting || isPastEvent ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-indigo-600 text-white hover:bg-indigo-800"}
                                `}
                                onClick={handleParticipateClick}
                                disabled={isSubmitting || isPastEvent} 
                            >
                                {isSubmitting ? (
                                    <>
                                        {safeTranslate(t,'participate')} <Spin size="small" />
                                    </>
                                ) : (
                                    isPastEvent ? safeTranslate(t,'event_expired') : safeTranslate(t,'participate')
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
