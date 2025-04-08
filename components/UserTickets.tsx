import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Skeleton, Carousel } from "antd";
import type { CarouselRef } from 'antd/es/carousel';
import { Event } from "@/types/types";
import { format } from "date-fns";
import Image from "next/image";
import { LuCalendarDays } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import QRCode from 'qrcode';
import { getAuth } from "firebase/auth";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "app/i18n";
import { safeTranslate } from "@/lib/utils";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion } from "framer-motion";
import type { TFunction } from "i18next";

interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  used: boolean;
}

const no_ticket_image = "/images/no-ticket.png";

const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < breakpoint);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [breakpoint]);
  return isMobile;
};

const UserTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<{ [key: string]: Event }>({});
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<{ [key: string]: string | null }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const carouselRef = useRef<CarouselRef>(null);
  const lng = useLanguage();
  const { t } = useTranslation(lng, "common") as { t: TFunction };
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const token = await user.getIdToken();
        const response = await fetch(`/api/get-user-tickets`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('An error occurred while fetching tickets');

        const data: Ticket[] = await response.json();
        const sortedTickets = data.sort((a, b) => Number(a.used) - Number(b.used));
        setTickets(sortedTickets);
      } catch (err) {
        if (err instanceof Error) {
          console.error(err.message);
        } else {
          console.error("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserTickets();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventPromises = tickets.map(ticket =>
        fetch(`/api/getEventById/${ticket.eventId}`)
          .then(res => res.json())
          .catch(() => null)
      );
      const eventsData = await Promise.all(eventPromises);
      const filteredEvents = eventsData.filter(Boolean);
      const eventsMap = Object.fromEntries(filteredEvents.map(event => [event.id, event]));
      setEvents(eventsMap);
    };

    if (tickets.length > 0) fetchEvents();
  }, [tickets]);

  const handleShowQRCode = async (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
    const qrData = JSON.stringify({ eventId: ticket.eventId, ticketId: ticket.id, userId: ticket.userId });
    const qrCodeUrl = await QRCode.toDataURL(qrData);
    setQrCode(prev => ({ ...prev, [ticket.id]: qrCodeUrl }));
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedTicketId(null);
  };

  return (
    <div className="mb-12 relative">
      {tickets.length > 0 && !loading ? (
        <div className="w-[97%] sm:w-full mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-xl overflow-hidden">
          {isMobile ? (
            <>
              <Carousel dots={false} infinite={false} ref={carouselRef}>
                {tickets.map(ticket => (
                  <div key={ticket.id} className="px-2 w-full sm:w-[350px] mx-auto">
                    <TicketCard ticket={ticket} event={events[ticket.eventId]} onShowQRCode={handleShowQRCode} t={t} />
                  </div>
                ))}
              </Carousel>
              <div className="flex justify-center gap-4 mt-4">
                <motion.button whileTap={{scale: 1.3}} onClick={() => carouselRef.current?.prev()} className="bg-white text-black shadow p-2 rounded-full border border-gray-300 hover:shadow-md transition">
                  <FiChevronLeft size={24} />
                </motion.button>
                <motion.button whileTap={{scale: 1.3}} onClick={() => carouselRef.current?.next()} className="bg-white text-black shadow p-2 rounded-full border border-gray-300 hover:shadow-md transition">
                  <FiChevronRight size={24} />
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth">
              {tickets.map(ticket => (
                <div key={ticket.id} className="snap-center flex-shrink-0 w-full sm:w-[350px] max-w-[350px]">
                  <TicketCard ticket={ticket} event={events[ticket.eventId]} onShowQRCode={handleShowQRCode} t={t} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="sm:w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[95%] mx-auto flex flex-col items-center text-center p-6 border border-gray-300 rounded-lg shadow-md">
          <Image src={no_ticket_image} alt="no ticket image" className="w-auto max-h-36 h-full mb-4" width={500} height={200} />
          <p className="text-white text-xl font-semibold">{safeTranslate(t, 'no_ticket_yet')}</p>
          <p className="text-white text-md mt-2">{safeTranslate(t, 'no_ticket_description')}</p>
          <Link href={`/${lng}/explore`} className="bg-indigo-500 hover:bg-indigo-600 duration-300 font-bold text-lg px-6 py-2 mt-4 text-white rounded-xl">
            {safeTranslate(t, "explore")}
          </Link>
        </div>
      )}

      <Modal
        title="QR Code"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[<Button key="close" onClick={handleCloseModal}>{safeTranslate(t, 'close')}</Button>]}
      >
        {selectedTicketId && qrCode[selectedTicketId] ? (
          <div className="flex justify-center">
            <Image
              src={qrCode[selectedTicketId] as string}
              alt={`QR Code for Ticket ${selectedTicketId}`}
              width={600}
              height={600}
              className="rounded-lg"
            />
          </div>
        ) : (
          <p>{safeTranslate(t, 'qr_code_loading')}</p>
        )}
      </Modal>
    </div>
  );
};

const TicketCard = ({ ticket, event, onShowQRCode, t }: { ticket: Ticket; event?: Event; onShowQRCode: (t: Ticket) => void; t: TFunction }) => {
  return event ? (
    <div className="rounded bg-white shadow-md flex flex-col gap-4 overflow-hidden rounded-xl">
      <Image
        alt={event.title}
        src={event.images[0]}
        width={250}
        height={140}
        className="object-cover w-full h-[250px] max-h-[250px] mx-auto"
      />
      <div className="px-4 mb-4 flex flex-col gap-4">
        <div className="w-full flex items-center justify-between">
          <p className="text-lg font-bold">{event.title}</p>
          {ticket.used && (
            <p className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-300 w-fit">
              {safeTranslate(t, 'used_ticket_badge')}
            </p>
          )}
        </div>
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <LuCalendarDays />
          {format(new Date(event.date), 'dd MMMM yyyy')}
        </p>
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <IoLocationOutline />
          {event.place}
        </p>
        <Button type="primary" onClick={() => onShowQRCode(ticket)}>
          {safeTranslate(t, 'show_qr_code')}
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-4 px-4 py-6">
      <Skeleton.Input active size="small" className="w-full" />
      <Skeleton active paragraph={{ rows: 2 }} className="w-full" />
      <Skeleton.Button active size="default" className="w-full" />
    </div>
  );
};

export default UserTickets;