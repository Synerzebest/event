import React, { useEffect, useState, useMemo } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Event } from '@/types/types';
import { motion } from "framer-motion";
import OrganizerSection from "./OrganizerSection"
import EventTicket from "./EventTicket";
import EventRevenue from "./EventRevenue";

interface EventPopupProps {
    event: Event;
    onClose: () => void;
}

interface TicketParticipant {
    firstName: string;
    lastName: string;
    name: string;
    userId: string;
    eventId: string;
    used: boolean;
    price: number;
    purchaseDate: string;
  }
const EventPopup: React.FC<EventPopupProps> = ({ event, onClose }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [allTickets, setAllTickets] = useState<TicketParticipant[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<TicketParticipant[]>([]);

    useEffect(() => {
        const fetchTickets = async () => {
          try {
            const res = await fetch(`/api/tickets/byEvent/${event.id}`);
            if (res.ok) {
              const tickets = await res.json();
              setAllTickets(tickets);
              setFilteredTickets(tickets);
            }
          } catch (err) {
            console.error("Erreur lors du chargement des tickets:", err);
          }
        };
      
        if (event?.id) fetchTickets();
    }, [event.id]);

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

                <OrganizerSection eventId={event.id} />

                <EventTicket ticketsSummary={ticketsSummary} />

                <EventRevenue ticketsSummary={ticketsSummary} totalRevenue={totalRevenue} />

                <motion.div
                    className="py-6"
                >
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Participants ({filteredTickets.length})</h3>
                    <input
                        type="text"
                        placeholder="Rechercher un nom ou prénom..."
                        value={searchQuery}
                        onChange={(e) => {
                            const query = e.target.value.toLowerCase();
                            setSearchQuery(query);
                          
                            if (query === "") {
                              // Réaffiche tous les tickets si champ vidé
                              setFilteredTickets(allTickets);
                            } else {
                              const filtered = allTickets.filter(
                                (t) =>
                                  t.firstName?.toLowerCase().includes(query) ||
                                  t.lastName?.toLowerCase().includes(query)
                              );
                              setFilteredTickets(filtered);
                            }
                          }}
                        className="border rounded-lg p-3 w-full bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    {filteredTickets.length === 0 ? (
                        <p className="text-gray-600">Aucun participant trouvé.</p>
                    ) : (
                        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {filteredTickets.map((ticket, index) => (
                            <li key={index} className="flex items-center justify-between text-gray-700 border-b py-2">
                            <span>{ticket.firstName} {ticket.lastName}</span>
                            <span className="text-sm text-gray-500 italic">{ticket.name}</span>
                            </li>
                        ))}
                        </ul>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default EventPopup;
