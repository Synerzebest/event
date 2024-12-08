"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Skeleton, notification } from "antd";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Event } from '@/types/types';
import EventPopup from "./EventPopup";
import EditEventPopup from "./EditEventPopup";
import UserTickets from "./UserTickets";
import { FaUser, FaHeart } from "react-icons/fa";
import { FaShare } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";


export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true); 
    const [likedEvents, setLikedEvents] = useState<string[]>([]);
    const [menuOpenEventId, setMenuOpenEventId] = useState<string | null>(null); 
    const menuRef = useRef<HTMLDivElement>(null);
    const [editEvent, setEditEvent] = useState<Event | null>(null); 

    useEffect(() => {
        // Vérifier si on est dans le navigateur (côté client)
        if (typeof window !== 'undefined') {
        const storedLikedEvents = localStorage.getItem('likedEventIds');
        if (storedLikedEvents) {
            setLikedEvents(JSON.parse(storedLikedEvents));
        }
        }
    }, []);

    const { user } = useFirebaseUser();
    const userId = user?.uid || "";

    // Event popup
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Fetch all events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/getEvents', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch events");
                }

                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuOpenEventId && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpenEventId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpenEventId]);

    const handleManageEvent = async (eventId: string) => {
        const event = events.find((e) => e.id === eventId);
        if (event) {
            setSelectedEvent(event);
        }
    };

    const handleClosePopup = () => {
        setSelectedEvent(null);
    };

    // Fetching user events
    useEffect(() => {
        if (!userId) return;

        const fetchUserEvents = async (userId: string) => {
            try {
                const response = await fetch(`/api/getMyEvents/${userId}`);
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserEvents(userId);
    }, [userId]);

    // Handle like functionality
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

    const handleEditEvent = (event: Event) => {
        setEditEvent(event);
    };

    const handleCloseEditPopup = () => {
        setEditEvent(null);
    };

    const updateEvent = (updatedEvent: Event) => {
        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event
            )
        );
    };

    return (
        <div className="container mx-auto py-16">
            <section className="py-16">
                <h2 className="text-3xl sm:text-2xl text-center sm:text-start font-bold mb-8">My Tickets</h2>
                <UserTickets userId={userId} />

                <h2 className="text-3xl sm:text-2xl text-center sm:text-start font-bold mb-8">Your Events</h2>
                <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <div key={index} className="flex-1 min-w-[300px] max-w-[350px] rounded-lg overflow-hidden shadow-lg bg-white">
                                <Skeleton.Image style={{ width: 350, height: 200 }} />
                                <div className="p-4">
                                    <Skeleton active paragraph={{ rows: 2 }} />
                                    <Skeleton.Button active style={{ width: 100, marginTop: 16 }} />
                                </div>
                            </div>
                        ))
                    ) : events.length === 0 ? (
                        <div className="text-center text-gray-500 text-xl">You don&apos;t have any event yet.</div>
                    ) : (
                        events.map(event => {
                            const isLiked = likedEvents.includes(event.id); 
                            const isMenuOpen = menuOpenEventId === event.id; // Check if the current event's menu is open
                            return (
                                <div key={event.id} className="relative flex-1 min-w-[300px] max-w-[350px] rounded-lg shadow-lg bg-white">
                                    {isMenuOpen && (
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
                                        className="object-cover rounded-t-lg"
                                    />

                                    <button
                                        className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-20 focus:outline-none duration-300"
                                        onClick={() => setMenuOpenEventId(isMenuOpen ? null : event.id)} // Open/close menu for the clicked event
                                    >
                                        <FaShare className="w-4 h-4 text-white" />
                                    </button>
                                    <div className="p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-xl">{event.title}</h3>
                                            <div className="border border-blue-600 text-blue-600 text-sm font-bold py-1 px-2 rounded flex items-center gap-1 whitespace-nowrap">
                                                {event.currentGuests !== undefined ? event.currentGuests : 0} / {event.guestLimit} <FaUser />
                                            </div>
                                        </div>
                                        <p className="text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR')} | {event.place}</p>
                                        <p className="text-gray-700 mt-2">{event.description}</p>
                                        <div className="flex justify-between items-center gap-4 mt-4">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    className=" bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
                                                    onClick={() => handleManageEvent(event.id)}
                                                >
                                                    Manage Event
                                                </button>
                                                <button
                                                    onClick={() => handleLike(event.id)}
                                                    className={`${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                                                >
                                                    <FaHeart size={24} className={`transition-colors duration-200 ${isLiked ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                            {event.createdBy === userId && (
                                                <div>
                                                    <button className="p-2 rounded-full hover:bg-gray-100 duration-300" onClick={() => handleEditEvent(event)}>
                                                        <IoIosSettings size={25} className="text-gray-500" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
                </section>

                {editEvent && (
                    <EditEventPopup
                        event={editEvent}
                        onClose={handleCloseEditPopup}
                        onUpdateEvent={updateEvent}
                    />
                )}

                {selectedEvent && (
                    <EventPopup
                        event={selectedEvent}
                        onClose={handleClosePopup}
                    />
                )}

                <section className="mt-8">
                    <h2 className="text-3xl sm:text-2xl font-bold mb-8 text-center sm:text-start">Favorite Events</h2>
                    <div className="flex gap-8 flex-wrap justify-center sm:justify-start">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="flex-1 min-w-[300px] max-w-[350px] rounded-lg overflow-hidden shadow-lg bg-white">
                                    <Skeleton.Image style={{ width: 350, height: 200 }} />
                                    <div className="p-4">
                                        <Skeleton active paragraph={{ rows: 2 }} />
                                        <Skeleton.Button active style={{ width: 100, marginTop: 16 }} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            likedEvents.length === 0 ? (
                                <div className="text-gray-500 text-xl">You don&apos;t have any favorite events yet.</div>
                            ) : (
                                likedEvents.map((eventId) => {
                                    const event = events.find((e) => e.id === eventId);
                                    if (!event) return null; 

                                    return (
                                        <div key={event.id} className="flex-1 min-w-[300px] max-w-[350px] rounded-lg shadow-lg bg-white">
                                            <Image
                                                src={event.images[0]}
                                                alt={event.title}
                                                width={350}
                                                height={200}
                                                className="object-cover rounded-t-lg"
                                            />
                                            <div className="p-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <h3 className="font-bold text-xl">{event.title}</h3>
                                                    <div className="border border-blue-600 text-blue-600 text-sm font-bold py-1 px-2 rounded flex items-center gap-1 whitespace-nowrap">
                                                        {event.currentGuests !== undefined ? event.currentGuests : 0} / {event.guestLimit} <FaUser />
                                                    </div>
                                                </div>
                                                <p className="text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR')} | {event.place}</p>
                                                <p className="text-gray-700 mt-2">{event.description}</p>
                                                <div className="flex gap-4 mt-4">
                                                    <button
                                                        onClick={() => handleLike(event.id)}
                                                        className={`p-2 rounded ${likedEvents.includes(event.id) ? 'text-red-500' : 'text-gray-400'}`}
                                                    >
                                                        <FaHeart size={24} className={`transition-colors duration-200 ${likedEvents.includes(event.id) ? 'fill-current' : ''}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </section>
            </div>
    );
}
