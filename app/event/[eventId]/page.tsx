"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation"; 
import { Navbar, Footer, Countdown, EventComponent } from "@/components";
import { Spin } from 'antd';
import useFirebaseUser from "@/lib/useFirebaseUser";

const Page = () => {
    const { eventId } = useParams() as { eventId: string };
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";

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

    return (
        <>
            {loading ? (
                <>
                    <Navbar />
                    <div className="w-full flex justify-center relative top-24">
                        <Spin size="large" />
                    </div>
                </>
            ) : !event ? (
                <>
                    <Navbar />
                    <div className="w-full flex justify-center relative top-24">
                        <p>Nothing to see here</p>
                    </div>
                </>
            ) : (
                <>
                    <Navbar />
                    <div className="w-full flex flex-col items-center gap-32">
                        <div>
                            <Countdown eventDate={event.date} />
                        </div>

                        <div className="w-11/12 mx-auto flex justify-center">
                            <EventComponent eventId={eventId} userId={userId} participateButton={true} />
                        </div>
                    </div>
                    <Footer />
                </>
            )}
            
        </>
    );
};

export default Page;
