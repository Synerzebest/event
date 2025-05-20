import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Event } from '@/types/types';
import Image from "next/image";
import { Spin, Popconfirm, notification } from 'antd';
import QRCodeScanner from "./QRCodeScanner";
import { motion } from "framer-motion";
import { FaUser } from "react-icons/fa";
import { LuCalendarDays } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { format } from "date-fns";
import { getAuth } from "firebase/auth";


interface EventPopupProps {
    event: Event;
    onClose: () => void;
}

interface User {
    uid: string;
    name: string;
    email: string;
    photoURL: string;
    displayName: string;
}

interface Organizer {
    id: string;
    name: string;
    imageUrl: string;
}

interface TicketSummary {
    name: string;
    price: number;
    quantity: number;
    sold: number;
    revenue: number;
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
    const [organizers, setOrganizers] = useState<Organizer[]>([]);
    const [loadingOrganizers, setLoadingOrganizers] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [showScanner, setShowScanner] = useState<boolean>(false);

    // Calculate event revenue
    const [totalRevenue, setTotalRevenue] = useState<number>(0);
    const [ticketsSummary, setTicketsSummary] = useState<TicketSummary[]>([]);

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
      

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
      
        if (user) {
          setCurrentUserId(user.uid);
        }
      }, []);

    // Récupérer les organisateurs
    useEffect(() => {
        const fetchOrganizers = async () => {
            setLoadingOrganizers(true);
    
            if (Array.isArray(event.organizers) && event.organizers.length > 0) {
                const organizerDetails = await Promise.all(event.organizers.map(async (id) => {
                    const response = await fetch(`/api/users/${id}`);
                    if (response.ok) {
                        const userData = await response.json();
                        return {
                            id: id, 
                            ...userData 
                        };
                    }
                    return null;
                }));
    
                setOrganizers(organizerDetails.filter(Boolean)); // Ne garde que les organisateurs valides
            } else {
                setOrganizers([]); // Si pas d'organisateurs, on met un tableau vide
            }
    
            setLoadingOrganizers(false);
        };
    
        fetchOrganizers();
    }, [event.organizers]);
    

    // Gérer la recherche d'utilisateurs
    const handleSearchChange = async (query: string) => {
        setSearchQuery(query);
        if (query) {
            const response = await fetch(`/api/searchUsers?query=${query}`);
            if (response.ok) {
                const usersData = await response.json();
                setUsers(usersData);
            }
        } else {
            setUsers([]);
        }
    };

    // Gérer l'ajout d'un organisateur
    const handleAddOrganizer = async (userId: string) => {
        try {
            const response = await fetch(`/api/events/${event.id}/addOrganizers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ organizers: [userId] }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to add organizer');
            }
    
            // Récupérer les détails complets du nouvel organisateur ajouté
            const userResponse = await fetch(`/api/users/${userId}`);
            if (!userResponse.ok) {
                throw new Error('Failed to fetch organizer details');
            }
            
            const newOrganizer = await userResponse.json();
    
            // Ajouter le nouvel organisateur avec ses détails dans l'état
            setOrganizers((prev) => [...prev, { id: userId, ...newOrganizer }]);
    
            notification.success({
                message: "Organizer added!",
                description: "The user has been successfully added as an organizer.",
                placement: "topRight",
                duration: 3,
            });
        } catch (error) {
            console.error("Error adding organizer:", error);
            notification.error({
                message: "Error",
                description: "An error occurred while adding the organizer.",
                placement: "topRight",
                duration: 3,
            });
        }
    };
    

    // Gérer la suppression d'un organisateur
    const handleRemoveOrganizer = async (userId: string, eventId: string) => {
        try {
            const response = await fetch(`/api/removeOrganizer`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ eventId, organizerId: userId }), 
            });
    
            if (!response.ok) {
                throw new Error('Failed to remove organizer');
            }
    
            setOrganizers((prev) => prev.filter((organizer) => organizer.id !== userId));
    
            notification.success({
                message: "Organizer removed!",
                description: "The organizer has been successfully removed.",
                placement: "topRight",
                duration: 3,
            });
        } catch (error) {
            console.error("Error removing organizer:", error);
            notification.error({
                message: "Error",
                description: "An error occurred while removing the organizer.",
                placement: "topRight",
                duration: 3,
            });
        }
    };

    const handleScanTicket = async (data: string | null) => {
        if (data) {
            try {
                // Essayez de parser les données JSON du QR code
                const ticketInfo = JSON.parse(data);
                const ticketId = ticketInfo.ticketId;
                const eventId = ticketInfo.eventId;
    
                // Envoyez une requête pour vérifier le ticket scanné
                const response = await fetch(`/api/validateTicket`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ticketId, eventId }),
                });
    
                const result = await response.json();
    
                if (response.ok && result.message === 'Ticket validated successfully') {
                    notification.success({
                        message: 'Ticket validated',
                        description: 'Ticket validated, it is no longer a valid ticket',
                    });
                } else {
                    notification.error({
                        message: 'Invalid Ticket',
                        description: result.message || 'This ticket is invalid or has already been used.',
                    });
                }
            } catch (error) {
                console.error('An error occurred while validating the ticket:', error);
                notification.error({
                    message: 'Oups! Something went wrong',
                    description: "An error occurred while validating the ticket.",
                });
            } finally {
                setShowScanner(false);
            }
        }
    };
    
    useEffect(() => {
        if (event.tickets) {
            const summary = event.tickets.map(ticket => ({
                name: ticket.name,
                price: ticket.price,
                quantity: ticket.quantity,
                sold: ticket.sold,
                revenue: ticket.sold * ticket.price,
            }));
            
            setTicketsSummary(summary);
            console.log(ticketsSummary)

            // Calculer le revenu total
            const total = summary.reduce((acc, ticket) => acc + ticket.revenue, 0);
            setTotalRevenue(total);
        }
    }, [event.tickets, ticketsSummary]);

    const formattedDate = format(new Date(event.date), 'dd MMMM yyyy');

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
                className="absolute inset-0 bg-gray-800 opacity-50" 
                onClick={onClose} 
                style={{ backdropFilter: 'blur(5px)' }}
            ></div>
            <motion.div
                className="bg-white rounded-lg shadow-lg z-10 p-6 w-[95%] sm:w-full max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl relative overflow-y-scroll h-[90vh] no-scrollbar"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ duration: 0.3 }}
            >
                <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={onClose}>
                    <IoMdClose size={24} />
                </button>
                
                {/* Scan Ticket Button */}
                <motion.button
                    onClick={() => setShowScanner(true)}
                    className="absolute left-1/2 -translate-x-1/2 text-white bg-indigo-500 border border-indigo-500 font-bold p-3 rounded-lg shadow-lg mt-[-0.5rem] sm:mt-4 hover:bg-indigo-600 transition-all"
                >
                    Scan Ticket
                </motion.button>

                {showScanner && (
                    <div className="mt-6">
                        <p className="text-indigo-500 font-semibold">Scan QR Code</p>
                        <QRCodeScanner 
                            onScan={handleScanTicket} 
                            onClose={() => setShowScanner(false)} 
                        />
                        <button
                            onClick={() => setShowScanner(false)}
                            className="mt-2 text-indigo-500 underline"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Event Title */}
                <div className="mt-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 my-4">{event.title}</h2>

                    <div className="border border-indigo-600 text-indigo-600 text-sm font-bold py-1 px-2 rounded inline-flex items-center gap-1 whitespace-nowrap">
                        {event.currentGuests !== undefined ? event.currentGuests : 0} / {event.guestLimit} <FaUser />
                    </div>

                    <p className="text-gray-600 text-start flex items-center my-2"><LuCalendarDays className="mr-2" /> {formattedDate}</p>
                    <p className="text-gray-600 text-start flex items-center"><IoLocationOutline className="mr-2" /> {event.place}</p>
                    <p className="text-gray-700 mt-4">{event.description}</p>
                    
                </div>

                {/* Add Organizers Section */}
                <motion.div 
                    className="py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Add Organizers</h3>
                    <input
                        type="text"
                        placeholder="Find organizers..."
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="border rounded-lg p-3 w-full bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {searchQuery && (
                        <ul className="space-y-3">
                            {users.map((user) => {
                                const isOrganizer = organizers.some((organizer) => organizer.id === user.uid);
                                return (
                                    <motion.li
                                        key={user.uid}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Image src={user.photoURL} alt="User profile" width={30} height={30} className="rounded-full" />
                                            <span className="text-lg">{user.displayName}</span>
                                        </div>
                                        <motion.button 
                                            className={`text-indigo-500 ${isOrganizer ? 'cursor-not-allowed text-gray-400' : ''}`}
                                            onClick={() => handleAddOrganizer(user.uid)}
                                            disabled={isOrganizer}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {isOrganizer ? 'Added' : 'Add'}
                                        </motion.button>
                                    </motion.li>
                                );
                            })}
                        </ul>
                    )}
                </motion.div>

                {/* Organizers List */}
                <motion.div 
                    className="py-6 border-b"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Organizers ({organizers.length})</h3>
                    {loadingOrganizers ? (
                        <div className="flex justify-center items-center my-4">
                            <Spin />
                        </div>
                    ) : organizers.length === 0 ? (
                        <p className="text-gray-600 my-4">No organizers yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {organizers.map((organizer, index) => {

                                const isCurrentUser = currentUserId === organizer.id;
                                const isCreator = organizer.id === event.createdBy;

                                return(
                                    <li key={index} className="flex items-center justify-between text-gray-600">
                                        <div className="flex items-center gap-3">
                                            <Image src={organizer.imageUrl} alt="Organizer profile" width={30} height={30} className="rounded-full"/>
                                            <span className="text-lg">{organizer.name}</span>
                                        </div>
                                        {isCreator ? (
                                            <span className="text-gray-400 italic">Creator</span>
                                        ) : (
                                            <Popconfirm
                                                title={isCurrentUser ? "Are you sure you want to remove yourself as an organizer?" : "Are you sure you want to remove this organizer?"}
                                                onConfirm={() => handleRemoveOrganizer(organizer.id, event.id)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <button className="text-red-500 hover:text-red-700 transition">Remove</button>
                                            </Popconfirm>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </motion.div>

                {/* Tickets Section */}
                <motion.div 
                    className="py-6 border-b"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                >
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Tickets</h3>
                    {ticketsSummary.length > 0 ? (
                        <ul className="space-y-3">
                            {ticketsSummary.map((ticket, index) => (
                                <motion.li 
                                    key={index} 
                                    className="flex justify-between items-center text-lg"
                                >
                                    <span>{ticket.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">
                                            Available: {ticket.quantity}
                                        </span>
                                        <span className="text-gray-400">
                                            ({ticket.sold} sold)
                                        </span>
                                    </div>
                                    
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600">No tickets available</p>
                    )}
                </motion.div>

                {/* Revenue Section */}
                <motion.div 
                    className="py-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                >
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Revenue</h3>
                    <p className="text-xl font-bold text-green-600 mb-4">Total: {totalRevenue} €</p>
                    {ticketsSummary.length > 0 && (
                        <div>
                            <h4 className="font-semibold">Sales Details</h4>
                            <ul className="space-y-2 mt-2">
                                {ticketsSummary.map((ticket, index) => (
                                    <li key={index} className="flex justify-between text-gray-600">
                                        <span>{ticket.name}</span>
                                        <span>{ticket.sold} x {ticket.price} € = {ticket.revenue} €</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
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
                              // 🔁 Réaffiche tous les tickets si champ vidé
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
