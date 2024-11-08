"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Skeleton } from 'antd';
import useFirebaseUser from '@/lib/useFirebaseUser';
import { EventComponent } from '.';

const Events = () => {
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [likedEvents, setLikedEvents] = useState<string[]>([]);

    useEffect(() => {
        // Vérifier si on est dans le navigateur (côté client)
        if (typeof window !== 'undefined') {
        const storedLikedEvents = localStorage.getItem('likedEventIds');
        if (storedLikedEvents) {
            setLikedEvents(JSON.parse(storedLikedEvents));
        }
        }
    }, []);

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

    return (
        <div className="container mx-auto py-16">
            <h2 className="text-2xl font-bold mb-8 text-center sm:text-start">Upcoming Events</h2>
            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                {loading ? (
                    // Affiche des skeletons en attendant que les événements soient chargés
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
                    <div className="text-center text-gray-500 text-xl">No events available</div>
                ) : (
                    events.map((event) => {
                        return (
                            <EventComponent key={event.id} eventId={event.id} userId={userId} participateButton={true} />
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Events;
