import React, { useState, useEffect } from 'react';
import { Button, Modal, Skeleton } from "antd";
import { Event } from "@/types/types";
import { format } from "date-fns";
import Image from "next/image";
import { LuCalendarDays } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import QRCode from 'qrcode';
import { getAuth } from "firebase/auth";
import useLanguage from "@/lib/useLanguage";
import { useTranslation } from "app/i18n";
import { safeTranslate } from "@/lib/utils";
import Link from "next/link";

interface Ticket {
    id: string;
    userId: string;
    eventId: string;
    used: boolean;
}

const no_ticket_image = "/images/no-ticket.png"

const UserTickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [events, setEvents] = useState<{ [key: string]: Event }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<{ [key: string]: string | null }>({});
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

    useEffect(() => {
        const fetchUserTickets = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
    
                if (!user) {
                    throw new Error("User not authenticated");
                }
    
                const token = await user.getIdToken();
    
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
    
                const sortedTickets = data.sort((a, b) => Number(a.used) - Number(b.used));
    
                setTickets(sortedTickets);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message); // Ici on s'assure que `error` est bien une instance de `Error`
                } else {
                    setError("An unknown error occurred"); // Cas où `error` n'est pas une instance de `Error`
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

        const ticketRef = doc(db, "tickets", ticket.id);
        const ticketSnapshot = await getDoc(ticketRef);

        if (!ticketSnapshot.exists()) {
            console.log(error)
            setError(`${t('unvalid_ticket')}`);
            return;
        }

        const ticketData = ticketSnapshot.data();
        if (ticketData.used) {
            setError(`${t('already_used_ticket')}`);
            return;
        }

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
        <div className="mb-12">
    {tickets.length > 0 && !loading ? (
        <div className="w-[95%] mx-auto sm:w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-xl overflow-hidden">
            <ul className="w-full flex flex-nowrap overflow-x-auto snap-x snap-mandatory scroll-smooth items-start gap-4 no-scrollbar">
                {tickets.map(ticket => (
                    <li 
                        key={ticket.id} 
                        className="rounded mb-2 min-w-[350px] max-w-[350px] flex-none flex flex-col gap-4 snap-center bg-white rounded-xl"
                    >
                        {events[ticket.eventId] ? (
                            <>
                                <div>
                                    <Image 
                                        alt={`${events[ticket.eventId].title}`} 
                                        src={`${events[ticket.eventId].images[0]}`} 
                                        width={250}
                                        height={140}
                                        className="object-cover w-full h-[250px] max-h-[250px] mx-auto border-0 border-b rounded-t-xl"
                                    />
                                </div>
                                <div className="px-4 mb-4 flex flex-col gap-4">
                                    <div className="w-full flex items-center justify-between">
                                        <p className="text-lg font-bold">{events[ticket.eventId].title}</p>

                                        {ticket.used ? (
                                            <p className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-300 w-fit">
                                                {safeTranslate(t,'used_ticket_badge')}
                                            </p>
                                        ) : null}
                                    </div>
                                    
                                    <p className="flex items-center gap-2 text-sm sm:text-base">
                                        <LuCalendarDays />
                                        {format(new Date(events[ticket.eventId].date), 'dd MMMM yyyy')}
                                    </p>
                                    <p className="flex items-center gap-2 text-sm sm:text-base">
                                        <IoLocationOutline />
                                        {events[ticket.eventId].place}
                                    </p>
                                    <Button type="primary" onClick={() => handleShowQRCode(ticket)}>
                                        {safeTranslate(t,'show_qr_code')}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col gap-4 px-4 py-6">
                                <Skeleton.Input active size="small" className="w-full" />
                                <Skeleton active paragraph={{ rows: 2 }} className="w-full" />
                                <Skeleton.Button active size="default" className="w-full" />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
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

    {/* Popup Modal pour le QR Code */}
    <Modal
        title="QR Code"
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
            <Button key="close" onClick={handleCloseModal}>
                {safeTranslate(t,'close')}
            </Button>
        ]}
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
            <p>{safeTranslate(t,'qr_code_loading')}</p>
        )}
    </Modal>
</div>

    );
};

export default UserTickets;
