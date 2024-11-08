import React, { useState, useEffect } from 'react';
import { Spin, Button, Modal } from "antd";
import { Event } from "@/types/types";
import { format } from "date-fns";
import Image from "next/image";
import { LuCalendarDays } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { db } from "@/lib/firebaseConfig"; // Assurez-vous que la config Firebase est bien configurée
import { doc, getDoc } from "firebase/firestore";
import QRCode from 'qrcode';
import { getAuth } from "firebase/auth";  // Importer Firebase Authentication

interface Ticket {
    id: string;
    userId: string;
    eventId: string;
    used: boolean;
}

const UserTickets = ({ userId }: { userId: string }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [events, setEvents] = useState<{ [key: string]: Event }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<{ [key: string]: string | null }>({});
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                // Récupérer le token d'authentification de l'utilisateur
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    throw new Error("User not authenticated");
                }

                const token = await user.getIdToken();  // Récupérer le token d'authentification

                // Effectuer la requête API avec l'en-tête Authorization
                const response = await fetch(`/api/get-user-tickets`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('An error occurred while fetching tickets');
                }

                const data: Ticket[] = await response.json();
                setTickets(data);
            } catch (error) {
                setError(error.message);
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
                    .catch(error => {
                        console.error(`Erreur lors de la récupération de l'événement ${ticket.eventId}:`, error);
                        return null;
                    })
            );

            const eventsData = await Promise.all(eventPromises);
            const filteredEvents = eventsData.filter(event => event !== null);
            const eventsMap = Object.fromEntries(filteredEvents.map(event => [event.id, event]));
            setEvents(eventsMap);
        };

        if (tickets.length > 0) {
            fetchEvents();
        }
    }, [tickets]);

    const handleShowQRCode = async (ticket: Ticket) => {
        setSelectedTicketId(ticket.id);

        // Vérifiez si le ticket est valide et non utilisé
        const ticketRef = doc(db, "tickets", ticket.id);
        const ticketSnapshot = await getDoc(ticketRef);

        if (!ticketSnapshot.exists()) {
            setError("Ticket non valide");
            return;
        }

        const ticketData = ticketSnapshot.data();
        if (ticketData.used) {
            setError("Ticket déjà utilisé");
            return;
        }

        // Générer le QR code avec les informations de validation
        const qrData = JSON.stringify({ eventId: ticket.eventId, ticketId: ticket.id, userId: ticket.userId });
        const qrCodeUrl = await QRCode.toDataURL(qrData);
        setQrCode(prev => ({ ...prev, [ticket.id]: qrCodeUrl }));
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedTicketId(null);
    };

    if (loading) {
        return <div className="w-full flex justify-center items-center"><Spin /></div>;
    }

    return (
        <div className="mb-12">
            {tickets.length > 0 ? (
                <ul className="flex flex-wrap items-start gap-4">
                    {tickets.map(ticket => (
                        <li key={ticket.id} className="border rounded mb-2 w-11/12 mx-auto sm:mx-0 sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col gap-4">
                            {events[ticket.eventId] ? (
                                <>
                                    <div>
                                        <Image 
                                            alt={`${events[ticket.eventId].title}`} 
                                            src={`${events[ticket.eventId].images[0]}`} 
                                            width={350}
                                            height={200}
                                            className="object-cover rounded-t-lg w-auto h-auto"
                                        />
                                    </div>
                                    <div className="px-4 mb-4 flex flex-col gap-4">
                                        <p className="text-lg font-bold">{events[ticket.eventId].title}</p>
                                        <p className="flex items-center gap-2">
                                            <LuCalendarDays />
                                            {format(new Date(events[ticket.eventId].date), 'dd MMMM yyyy')}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <IoLocationOutline />
                                            {events[ticket.eventId].place}
                                        </p>
                                        <Button type="primary" onClick={() => handleShowQRCode(ticket)}>
                                            Show QR Code
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <p>Chargement des détails de l'événement...</p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You don&apos;t have any ticket yet.</p>
            )}

            {/* Popup Modal pour le QR Code */}
            <Modal
                title="QR Code"
                visible={isModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="close" onClick={handleCloseModal}>
                        Fermer
                    </Button>
                ]}
            >
                {selectedTicketId && qrCode[selectedTicketId] ? (
                    <div className="flex justify-center">
                        <Image
                            src={qrCode[selectedTicketId] as string}
                            alt={`QR Code for Ticket ${selectedTicketId}`}
                            width={160}  // largeur ajustée
                            height={160} // hauteur ajustée
                            className="rounded-lg"
                        />
                    </div>
                ) : (
                    <p>Chargement du QR code...</p>
                )}
            </Modal>
        </div>
    );
};

export default UserTickets;
