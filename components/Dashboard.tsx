"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Skeleton, Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Event } from '@/types/types';
import EventPopup from "./EventPopup";
import EditEventPopup from "./EditEventPopup";
import UserTickets from "./UserTickets";
import { FaUser } from "react-icons/fa";
import { FaShare } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils"; 
import ScrollToTopButton from "./ScrollToTopButton";
import ShareModal from "./ShareModal";
import LikedEvents from "./LikedEvents";
import { AnimatePresence } from "framer-motion";

const no_event_image = "/images/no-event.png";

function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return isMobile;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [editEvent, setEditEvent] = useState<Event | null>(null); 
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [shareModalEvent, setShareModalEvent] = useState<Event | null>(null);
  const eventCarouselRef = useRef<CarouselRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lng = useLanguage();
  const { t } = useTranslation(lng, "common");
  const { user } = useFirebaseUser();
  const userId: string = user?.uid || "";
  const isMobile: boolean = useIsMobile();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/getEvents', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error("Failed to fetch events");
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
    if (!userId) return;
    const fetchUserEvents = async (userId: string) => {
      try {
        const response = await fetch(`/api/getMyEvents/${userId}`);
        const data = await response.json();
        setMyEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserEvents(userId);
  }, [userId]);

  const handleManageEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (event) setSelectedEvent(event);
  };

  const handleClosePopup = () => setSelectedEvent(null);
  const handleEditEvent = (event: Event) => setEditEvent(event);
  const handleCloseEditPopup = () => setEditEvent(null);

  const updateEvent = (updatedEvent: Event) => {
    setEvents((prev) => prev.map((event) => event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event));
  };

  const renderEventCard = (event: Event) => {
    return (
      <div className="relative rounded-xl shadow-md bg-white">
        <Image src={event.images[0]} alt={event.title} width={350} height={250} className="object-cover w-full h-[250px] max-h-[250px] mx-auto border-b rounded-t-xl" />
        <button className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-800 hover:bg-opacity-20 focus:outline-none duration-300" onClick={() => setShareModalEvent(event)}>
          <FaShare className="w-4 h-4 text-white" />
        </button>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-xl">{event.title}</h3>
            <div className="bg-indigo-500 text-white text-sm font-bold py-[0.35rem] px-3 rounded flex items-center gap-1 whitespace-nowrap">
              {event.currentGuests ?? 0} / {event.guestLimit} <FaUser />
            </div>
          </div>
          <p className="text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR')} | {event.place}</p>
          <p className="text-gray-700 mt-2 line-clamp-3">{event.description}</p>
          <div className="flex justify-between items-center gap-4 mt-4">
            <div className="flex items-center gap-4">
              <button className="bg-indigo-500 text-white font-bold py-2 px-4 rounded hover:bg-indigo-600" onClick={() => handleManageEvent(event.id)}>
                {safeTranslate(t, "more_info")}
              </button>
            </div>
            {event.createdBy === userId && (
              <button className="p-2 rounded-full hover:bg-gray-100 duration-300" onClick={() => handleEditEvent(event)}>
                <IoIosSettings size={25} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative top-44 container mx-auto">
      <section>
        <h2 className="text-3xl sm:text-2xl text-center sm:text-start font-bold mb-8">{safeTranslate(t,'my_tickets')}</h2>
        <UserTickets />

        <h2 className="text-3xl sm:text-2xl text-center sm:text-start font-bold mb-8">{safeTranslate(t,'my_events')}</h2>

        <div className="w-[97%] sm:w-full mx-auto">
          {loading ? (
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-full sm:w-[350px] rounded-lg shadow-lg bg-white">
                  <Skeleton.Image style={{ width: '100%', height: 200 }} />
                  <div className="p-4">
                    <Skeleton active paragraph={{ rows: 2 }} />
                    <Skeleton.Button active style={{ width: 100, marginTop: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : myEvents.length === 0 ? (
            <div className="w-full flex flex-col items-center text-center p-6 rounded-lg">
              <Image src={no_event_image} alt="no ticket image" className="w-auto max-h-36 h-full mb-4" width={500} height={200} />
              <p className="text-gray-700 text-xl font-semibold">{safeTranslate(t, 'no_event_yet')}</p>
              <p className="text-gray-700 text-md mt-2">{safeTranslate(t, 'no_event_description')}</p>
              <ScrollToTopButton />
            </div>
          ) : isMobile ? (
            <>
              <Carousel
                dots={false}
                infinite={false}
                ref={eventCarouselRef}
              >
                {myEvents.map(event => (
                  <div key={event.id} className="px-2">
                    {renderEventCard(event)}
                  </div>
                ))}
              </Carousel>
              <div className="flex justify-center gap-4 my-4">
                <button onClick={() => eventCarouselRef.current?.prev()} className="bg-white text-black shadow p-2 rounded-full border border-gray-300 hover:shadow-md transition">
                  <FiChevronLeft size={24} />
                </button>
                <button onClick={() => eventCarouselRef.current?.next()} className="bg-white text-black shadow p-2 rounded-full border border-gray-300 hover:shadow-md transition">
                  <FiChevronRight size={24} />
                </button>
              </div>
            </>
          ) : (
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {myEvents.map(event => (
                <div key={event.id} className="flex-shrink-0 w-[350px]">
                  {renderEventCard(event)}
                </div>
              ))}
            </div>
          )}
        </div>

        <h2 className="text-3xl sm:text-2xl text-center sm:text-start font-bold mb-8">{safeTranslate(t,'favorite_events')}</h2>
        <LikedEvents userId={userId} />
      </section>

      {editEvent && <EditEventPopup event={editEvent} onClose={handleCloseEditPopup} onUpdateEvent={updateEvent} />}
      <AnimatePresence>
        {selectedEvent && <EventPopup event={selectedEvent} onClose={handleClosePopup} />}
      </AnimatePresence>
      {shareModalEvent && (
        <ShareModal
            open={true}
            onClose={() => setShareModalEvent(null)}
            eventUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/event/${shareModalEvent.id}`}
            eventTitle={shareModalEvent.title}
        />
      )}
    </div>
  );
}
