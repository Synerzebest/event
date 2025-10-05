"use client"

import React, { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
// import { Button } from "antd";
import useFirebaseUser from '@/lib/useFirebaseUser';
import { EventComponent } from '.';
import { useTranslation } from "../app/i18n";
import { Event } from "@/types/types";
import { safeTranslate } from "@/lib/utils";

const Events = ({ lng }: { lng: "en" | "fr" | "nl" }) => {
    const { t } = useTranslation(lng, "common");
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    // const [showPastEvents, setShowPastEvents] = useState<boolean>(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('/api/getEvents', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const data: Event[] = await response.json();

                // Trier les événements par date, les plus récents d'abord
                const sortedEvents = data.sort((a, b) => {
                    const dateA = new Date(a.date).getTime();
                    const dateB = new Date(b.date).getTime();
                    return dateB - dateA;
                });

                setEvents(sortedEvents);
            } catch (error) {
                console.error('Error fetching events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const currentDate = new Date().getTime();
    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date).getTime();
        // return showPastEvents || eventDate >= currentDate;
        return eventDate >= currentDate;
    });

    return (
        <div className="relative top-28 sm:top-36 w-full sm:w-11/12 mx-auto flex flex-col">
            <div className="w-[95%] hidden sm:block mx-auto sm:mx-none sm:w-full flex-col sm:flex-row flex items-center justify-start sm:justify-between">
                <h2 className="text-2xl font-bold mb-8 text-center sm:text-start">{safeTranslate(t,'upcoming_events')}</h2>
            </div>
            <div className="flex flex-col gap-0 sm:gap-4 md:flex-row md:flex-wrap md:gap-4 md:justify-start">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={index}
                            className="flex-1 min-w-[300px] max-w-[350px] rounded-lg overflow-hidden shadow-lg bg-white"
                        >
                            <Skeleton.Image style={{ width: 350, height: 200 }} />
                            <div className="p-4">
                                <Skeleton active paragraph={{ rows: 2 }} />
                                <Skeleton.Button active style={{ width: 100, marginTop: 16 }} />
                            </div>
                        </div>
                    ))
                ) : filteredEvents.length === 0 ? (
                    <div className="text-center text-gray-500 text-xl">{safeTranslate(t,'events_availability')}</div>
                ) : (
                    filteredEvents.map((event) => (
                        <EventComponent key={event.id} eventId={event.id} userId={userId} participateButton={true} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Events;
