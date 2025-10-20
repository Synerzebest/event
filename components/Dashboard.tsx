"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Carousel } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Event } from '@/types/types';
import EventPopup from "./EventPopup";
import EditEventPopup from "./EditEventPopup";
import QRCodeScanModal from "./QRCodeScanModal";
import UserTickets from "./UserTickets";
import { motion } from "framer-motion";
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
import { MdQrCodeScanner } from "react-icons/md";
import { IoCalendarNumberSharp } from "react-icons/io5"
import { FaMapLocationDot } from "react-icons/fa6"
import { HiUserGroup } from "react-icons/hi"

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
  const [scannableEventIds, setScannableEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [editEvent, setEditEvent] = useState<Event | null>(null); 
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [shareModalEvent, setShareModalEvent] = useState<Event | null>(null);
  const eventCarouselRef = useRef<CarouselRef>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [qrScanEventId, setQrScanEventId] = useState<string | null>(null);
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

        if (Array.isArray(data)) {
          setMyEvents(data)
        } else {
          setMyEvents([])
          console.warn("getMyEvents returned non-array:", typeof(data))
        }
        setMyEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserEvents(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchUserScannerEvents = async () => {
      try {
        const res = await fetch(`/api/getUserScannerEvents/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user scanner access");
        const data = await res.json();
        setScannableEventIds(data.eventScanner || []);
      } catch (error) {
        console.error("Error fetching scanner access:", error);
      }
    };
    fetchUserScannerEvents();
  }, [userId]);  

  const handleManageEvent = async (eventId: string) => {
    const event = myEvents.find((e) => e.id === eventId) || events.find((e) => e.id === eventId);
    if (event) setSelectedEvent(event);
  };

  const handleClosePopup = () => setSelectedEvent(null);
  const handleEditEvent = (event: Event) => setEditEvent(event);
  const handleCloseEditPopup = () => setEditEvent(null);

  const updateEvent = (updatedEvent: Event) => {
    setEvents((prev) => prev.map((event) => event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event));
  };

  const renderEventCard = (event: Event) => {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  
    return (
      <motion.div
        className="relative flex-1 w-full sm:min-w-[320px] sm:max-w-[350px] bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg"
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* --- BARRE SUPÉRIEURE (titre + bouton share) --- */}
        <div className="flex justify-between items-center px-4 py-3 bg-white/80 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800 truncate">
            {event.title}
          </h3>
          <button
            className="p-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all duration-200"
            onClick={() => setShareModalEvent(event)}
            title="Partager"
          >
            <FaShare className="w-4 h-4 text-indigo-500" />
          </button>
        </div>
  
        {/* --- IMAGE --- */}
        <div className="relative">
          <Image
            src={event.images?.[0] || "/images/no-event.png"}
            alt={event.title}
            width={350}
            height={250}
            className="object-cover w-full h-[250px] border-0"
          />
        </div>
  
        {/* --- CONTENU --- */}
        <div className="p-4 flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            {/* Infos principales */}
            <div className="flex flex-col gap-2">
              <p className="text-gray-600 flex items-center text-sm">
                <IoCalendarNumberSharp className="text-indigo-500 mr-2 w-5 h-5" />
                {formattedDate}
              </p>
              <p className="text-gray-600 flex items-center text-sm">
                <FaMapLocationDot className="text-indigo-500 mr-2 w-5 h-5" />
                {event.place} - {event.city}
              </p>
              <p className="text-gray-700 mt-2 text-sm line-clamp-3">
                {event.description}
              </p>
            </div>
  
            {/* Nombre d’invités */}
            <div className="bg-indigo-500 text-white text-sm font-bold py-[0.35rem] px-3 rounded flex items-center gap-1 whitespace-nowrap h-fit">
              {event.currentGuests ?? 0} / {event.guestLimit}
              <HiUserGroup className="text-white w-5 h-5" />
            </div>
          </div>
  
          {/* --- BOUTONS --- */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              {(event.createdBy === userId || event.organizers?.includes(userId)) && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
                  onClick={() => handleManageEvent(event.id)}
                >
                  {safeTranslate(t, "more_info")}
                </motion.button>
              )}
            </div>
  
            <div className="flex items-center gap-2">
              {event.createdBy === userId && (
                <button
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  title="Modifier"
                  onClick={() => handleEditEvent(event)}
                >
                  <IoIosSettings size={22} className="text-gray-600" />
                </button>
              )}
  
              {(event.createdBy === userId ||
                event.organizers?.includes(userId) ||
                scannableEventIds.includes(event.id)) && (
                <button
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  title="Scanner les tickets"
                  onClick={() => setQrScanEventId(event.id)}
                >
                  <MdQrCodeScanner size={22} className="text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
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
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[350px] rounded-lg shadow-lg bg-white overflow-hidden"
                >
                  <div className="w-full h-[200px] bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse" />
                    <div className="h-8 bg-gray-300 rounded w-[100px] animate-pulse" />
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

        <h2 className="text-3xl sm:text-2xl text-center sm:text-start font-bold mb-8 mt-12">{safeTranslate(t,'favorite_events')}</h2>
        <LikedEvents userId={userId} />
      </section>

      {editEvent && <EditEventPopup event={editEvent} onClose={handleCloseEditPopup} onUpdateEvent={updateEvent} />}
      <AnimatePresence>
        {selectedEvent && <EventPopup event={selectedEvent} onClose={handleClosePopup} lng={lng} />}
      </AnimatePresence>
      {shareModalEvent && (
        <ShareModal
            open={true}
            onClose={() => setShareModalEvent(null)}
            eventUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/event/${shareModalEvent.id}`}
            eventTitle={shareModalEvent.title}
        />
      )}
      {qrScanEventId && (
        <QRCodeScanModal
          open={true}
          onClose={() => setQrScanEventId(null)}
          eventId={qrScanEventId}
          lng={lng}
        />
      )}
    </div>
  );
}
