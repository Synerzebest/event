import React, { useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Event } from '@/types/types';
import { motion } from "framer-motion";
import OrganizerSection from "./OrganizerSection";
import ScannerSection from "./ScannerSection";
import EventTicket from "./EventTicket";
import EventRevenue from "./EventRevenue";
import EventParticipants from "./EventParticipants";

interface EventPopupProps {
    event: Event;
    onClose: () => void;
    lng: string;
}

const EventPopup: React.FC<EventPopupProps> = ({ event, onClose, lng }) => {

    const ticketsSummary = useMemo(() => {
        if (!event?.tickets) return [];
        return event.tickets.map(ticket => ({
          name: ticket.name,
          price: ticket.price,
          quantity: ticket.quantity,
          sold: ticket.sold,
          revenue: ticket.sold * ticket.price,
        }));
      }, [event.tickets]);
      
      const totalRevenue = useMemo(() => {
        return ticketsSummary.reduce((acc, ticket) => acc + ticket.revenue, 0);
      }, [ticketsSummary]);


    return (
        <div className="fixed inset-0 flex items-end justify-center z-[9999]">
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0" 
                onClick={onClose} 
            ></div>
            <motion.div
                className="bg-white rounded-t-2xl shadow-2xl p-6 z-10 w-full max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl relative overflow-y-scroll h-[90vh] no-scrollbar"
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
            >
                <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={onClose}>
                    <IoMdClose size={24} />
                </button>

                <OrganizerSection eventId={event.id} lng={lng} />

                <ScannerSection eventId={event.id} lng={lng} />

                <EventTicket ticketsSummary={ticketsSummary} />

                <EventRevenue ticketsSummary={ticketsSummary} totalRevenue={totalRevenue} />

                <EventParticipants eventId={event.id} />
            </motion.div>
        </div>
    );
};

export default EventPopup;
