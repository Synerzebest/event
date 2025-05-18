"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; 
import { Navbar, Footer, Countdown, EventComponent } from "@/components";
import { Spin } from 'antd';
import useFirebaseUser from "@/lib/useFirebaseUser";
import { useTranslation } from '../../../i18n';
import { Event } from "@/types/types";

interface PageProps {
    params: {
      lng: string
    }
}

const Page = ({ params: { lng } }: PageProps) => {
    const { eventId } = useParams() as { eventId: string };
    const [event, setEvent] = useState<Event>();
    const [loading, setLoading] = useState(true);
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";

    const [isLoading, setIsLoading] = useState(true)
    const { i18n } = useTranslation(lng, 'common')

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
        if (i18n) {
          setIsLoading(false)
        }
      }, [i18n])
    
      if (isLoading) {
        return <div className="w-screen h-screen flex items-center justify-center text-4xl text-white px-4 py-2 font-bold">EaseEvent</div>
      }

    return (
        <>
            <Navbar lng={lng}/>
            {loading ? (
                <>
                    <div className="w-full flex justify-center relative top-24">
                        <Spin size="large" />
                    </div>
                </>
            ) : !event ? (
                <>
                    <div className="w-full flex justify-center relative top-24">
                        <p>Nothing to see here</p>
                    </div>
                </>
            ) : (
                <>
                        <div className="w-full flex justify-center relative top-8">
                            <Countdown eventDate={event.date} />
                        </div>

                        <div className="w-full flex justify-center relative top-12">
                            <EventComponent eventId={eventId} userId={userId} participateButton={true} />
                        </div>
                </>
            )}
            <Footer />
        </>
    );
};

export default Page;
