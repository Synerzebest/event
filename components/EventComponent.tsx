"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FaUser, FaHeart } from "react-icons/fa";
import { format } from "date-fns";
import { notification } from 'antd';
import { FaShare } from "react-icons/fa6";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EventComponentProps {
    eventId: string,
    userId?: string,
    participateButton: boolean,
}

const EventComponent: React.FC<EventComponentProps> = ({ eventId, userId, participateButton }) => {
    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<any>(null);
    const [likedEvents, setLikedEvents] = useState<string[]>([]);
    const [menuOpen, setMenuOpen] = useState(false); 
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

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

    useEffect(() => {
        const storedLikedEvents = localStorage.getItem('likedEventIds');
        if (storedLikedEvents) {
            setLikedEvents(JSON.parse(storedLikedEvents));
        }
    }, []);

    const handleLike = (eventId: string) => {
        const updatedLikedEvents = likedEvents.includes(eventId)
            ? likedEvents.filter(id => id !== eventId)
            : [...likedEvents, eventId];

        setLikedEvents(updatedLikedEvents);
        localStorage.setItem('likedEventIds', JSON.stringify(updatedLikedEvents));
    };

    const handleCopyLink = (eventId: string) => {
        const eventUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/event/${eventId}`;
        navigator.clipboard.writeText(eventUrl);
        notification.success({
            message: "Link Copied!",
            description: "Event link has been copied to clipboard.",
            placement: "topRight",
        });
    };

    const handleParticipateClick = () => {
        if (userId) {
            router.push(`${process.env.NEXT_PUBLIC_BASE_URL}/event/${eventId}/participate`);
        } else {
            router.push('/auth/signin');
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

    const formattedDate = format(new Date(event.date), 'dd MMMM yyyy');
    const isLiked = likedEvents.includes(event.id);

    return (
        <div className="relative flex-1 min-w-[300px] max-w-[350px] rounded-lg shadow-lg bg-white">
            {menuOpen && (
                <div 
                    ref={menuRef}
                    className="absolute top-[-3rem] z-10 right-2 bg-white border rounded-lg shadow-lg p-2 z-10"
                >
                    <button
                        className="text-gray-800 text-sm px-4 py-2 hover:bg-gray-100 w-full text-left"
                        onClick={() => handleCopyLink(event.id)}
                    >
                        Copy Event Link
                    </button>
                </div>
            )}

            <Image
                src={event.images[0]}
                alt={event.title}
                width={350}
                height={200}
                className="object-cover rounded-t-lg w-auto h-auto"
            />

            <button
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-20 focus:outline-none duration-300"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <FaShare className="w-4 h-4 text-white" />
            </button>
            <div className="p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-xl">{event.title}</h3>
                    <div className="border border-blue-600 text-blue-600 text-sm font-bold py-1 px-2 rounded flex items-center gap-1">
                        {event.currentGuests !== undefined ? event.currentGuests : 0} / {event.guestLimit} <FaUser />
                    </div>
                </div>
                <p className="text-gray-600 text-start">{formattedDate} | {event.place}</p>
                <p className="text-gray-700 mt-2">{event.description}</p>

                { participateButton ? (
                    <div className="flex gap-4 mt-4">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleParticipateClick}
                        >
                            Participate
                        </button>
                        <button
                            onClick={() => handleLike(event.id)}
                            className={`p-2 rounded-full hover:bg-gray-100 duration-200 focus:outline-none ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                        >
                            <FaHeart className={`w-6 h-6 ${isLiked ? 'fill-red-500' : ''}`} />
                        </button>
                    </div>
                ) : (
                    <>
                    </>
                )}
                
            </div>
        </div>
    );
};

export default EventComponent;
