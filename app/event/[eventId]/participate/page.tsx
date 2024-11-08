"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer } from "@/components";
import { Spin, Button, message, Select } from 'antd';
import useFirebaseUser from '@/lib/useFirebaseUser';
import Image from 'next/image'; 
import { format } from "date-fns";
import { LuCalendarDays } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { Ticket } from "@/types/types";
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

type Event = {
    title: string;
    date: string;
    place: string;
    images: string[];
    tickets: Ticket[];
};

const Page = () => {
    const { eventId } = useParams() as { eventId: string };
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [selectedTicketPrice, setSelectedTicketPrice] = useState<number | null>(null);
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";

    const handleCheckout = async () => {
        const stripe = await stripePromise;

        if (!stripe) {
            console.error('Stripe has not been initialized.');
            message.error('Une erreur s\'est produite lors de l\'initialisation de Stripe.');
            return;
        }

        if (!selectedTicket) {
            message.error('Please select a ticket before proceeding.');
            return;
        }

        if (!event || !event.tickets) {
            message.error('Event data is not available.');
            return;
        }

        const selectedTicketData = event.tickets.find(ticket => ticket.name === selectedTicket);

        if (!selectedTicketData) {
            message.error('Selected ticket not found.');
            return;
        }

        // Créer une session de paiement
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket: { 
                    name: selectedTicketData.name,
                    price: selectedTicketData.price,
                },
                userId: userId,
                eventId: eventId,
            }),
        });

        const session = await response.json();

        if (response.ok) {
            const result = await stripe.redirectToCheckout({ sessionId: session.id });

            if (result.error) {
                console.error(result.error.message);
                message.error('Une erreur s\'est produite lors de la redirection vers le paiement.');
            }
        } else {
            console.error(session.error);
            message.error('Une erreur s\'est produite lors de la création de la session de paiement.');
        }
    };

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

    const handleTicketChange = (value: string) => {
        setSelectedTicket(value);
        const selectedTicketData = event?.tickets.find(ticket => ticket.name === value);
        setSelectedTicketPrice(selectedTicketData ? selectedTicketData.price : null);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="w-full flex justify-center relative top-24">
                    <Spin size="large" />
                </div>
            </>
        );
    }

    if (!event) {
        return (
            <>
                <Navbar />
                <div className="w-full flex justify-center relative top-24">
                    <p>Nothing to see here</p>
                </div>
            </>
        );
    }

    const formattedDate = format(new Date(event.date), 'dd MMMM yyyy');

    return (
        <>
            <Navbar />
            <div className="flex flex-col md:flex-row w-11/12 mx-auto gap-8 pt-10">
                {/* Section de gauche : Détails du participant */}
                <div className="w-full md:w-2/3 flex flex-col">
                    <h3 className="text-2xl font-medium mb-4">Buy Ticket</h3>
                    
                    {/* Choix du ticket */}
                    <div className="flex flex-col w-full mb-6">
                        <label className="text-sm font-medium text-gray-700">Select Ticket</label>
                        <Select 
                            placeholder="Select a ticket"
                            value={selectedTicket}
                            onChange={handleTicketChange}
                            className="rounded-md shadow-sm border-gray-300"
                        >
                            {event.tickets.map((ticket) => (
                                <Select.Option key={ticket.name} value={ticket.name} disabled={ticket.quantity <= 0}>
                                    <span className="font-semibold">{ticket.name} - {ticket.price}€</span>
                                    <span className="text-gray-500"> ({ticket.quantity > 0 ? `${ticket.quantity} available` : "Sold Out"})</span>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
    
                    <Button 
                        type="primary" 
                        className="mt-4 px-4 py-2" 
                        onClick={handleCheckout}
                        disabled={!selectedTicket}
                    >   
                        Confirm Registration ({selectedTicketPrice ? `${selectedTicketPrice}€` : 'Select a ticket'})
                    </Button>
                </div>
    
                {/* Section de droite : Détails de l'événement */}
                <div className="w-full md:w-1/3 flex flex-col p-4 border border-gray-300 rounded-lg">
                    <h2 className="text-3xl font-semibold mb-2 text-center">{event.title}</h2>
                    <div className="overflow-hidden rounded-md mb-4">
                        {event.images.length > 0 && (
                            <Image
                                src={event.images[0]} // Utilisation de la première image
                                alt={event.title}
                                width={500}
                                height={300}
                                className="w-full h-auto"
                            />
                        )}
                    </div>
    
                    <div className="flex flex-col mb-2">
                        <div className="flex items-center mb-1">
                            <LuCalendarDays className="mr-2" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center">
                            <IoLocationOutline className="mr-2" />
                            <span>{event.place}</span>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Page;
