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
import { motion } from "framer-motion";
import useLanguage from "@/lib/useLanguage";
import { useRouter } from "next/navigation";

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
    const router = useRouter();
    const [processing, setProcessing] = useState<boolean>(false);

    const lng = useLanguage();

    const handleCheckout = async () => {
        setProcessing(true)
        if (!selectedTicket) {
            message.error('Veuillez sélectionner un ticket avant de continuer.');
            setProcessing(false);
            return;
        }
    
        if (!event || !event.tickets) {
            message.error('Les données de l’événement ne sont pas disponibles.');
            setProcessing(false);
            return;
        }
    
        const selectedTicketData = event.tickets.find(ticket => ticket.name === selectedTicket);
    
        if (!selectedTicketData) {
            message.error('Le ticket sélectionné est introuvable.');
            setProcessing(false);
            return;
        }
    
        // Gestion des tickets gratuits
        if (selectedTicketData.price === 0) {
            try {
                const response = await fetch('/api/tickets/free', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        eventId,
                        ticketName: selectedTicketData.name,
                        userId,
                    }),
                });
    
                if (response.ok) {
                    message.success('Votre inscription pour cet événement gratuit a été confirmée.');
                    router.push(`/success/${eventId}`);
                } else {
                    const error = await response.json();
                    message.error(`Erreur : ${error.message || 'Impossible de compléter la demande.'}`);
                }
            } catch (error) {
                console.error('Erreur lors de la gestion des tickets gratuits:', error);
                message.error('Une erreur s\'est produite lors de la réservation du ticket gratuit.');
            }
            setProcessing(false);
            return;
        }
    
        // Gestion des tickets payants
        const stripe = await stripePromise;
    
        if (!stripe) {
            console.error('Stripe n’a pas été initialisé.');
            message.error('Une erreur s\'est produite lors de l\'initialisation de Stripe.');
            setProcessing(false);
            return;
        }
    
        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticket: {
                        name: selectedTicketData.name,
                        price: selectedTicketData.price,
                        quantity: selectedTicketData.quantity,
                    },
                    userId,
                    eventId,
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
        } catch (error) {
            console.error('Erreur lors de la création de la session de paiement:', error);
            message.error('Une erreur s\'est produite lors du paiement.');
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
                <Navbar lng={lng} />
                <div className="w-full flex justify-center relative top-24">
                    <Spin size="large" />
                </div>
            </>
        );
    }

    if (!event) {
        return (
            <>
                <Navbar lng={lng} />
                <div className="w-full flex justify-center relative top-24">
                    <p>Nothing to see here</p>
                </div>
            </>
        );
    }

    const formattedDate = format(new Date(event.date), 'dd MMMM yyyy');

    return (
        <>
            <Navbar lng={lng} />
            <motion.div
                className="flex flex-col md:flex-row w-11/12 mx-auto gap-8 pt-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <motion.div
                    className="w-full md:w-2/3 flex flex-col bg-white p-8 shadow-lg rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-3xl font-semibold mb-6 text-gray-800">Acheter un Ticket</h3>

                    {/* Choix du ticket */}
                    <div className="flex flex-col w-full mb-8">
                        <label className="text-lg font-medium text-gray-600 mb-2">Choisir un Ticket</label>
                        <Select
                            placeholder="Sélectionner un ticket"
                            value={selectedTicket}
                            onChange={handleTicketChange}
                            className="rounded-md border border-gray-300 shadow focus:ring focus:ring-blue-500"
                            size="large"
                        >
                            {event.tickets.map((ticket) => (
                                <Select.Option key={ticket.name} value={ticket.name} disabled={ticket.quantity <= 0}>
                                    <div className="flex justify-between items-center">
                                    <span>{ticket.name}</span>
                                    <span className="text-gray-500">
                                        {ticket.quantity > 0 ? `${ticket.quantity} disponibles` : "Épuisé"}
                                    </span>
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <Button
                        type="primary"
                        className="w-full py-4 mt-4 from-blue-500 blue-600 transition-all rounded-lg"
                        size="large"
                        onClick={handleCheckout}
                        disabled={!selectedTicket || processing} // Désactive le bouton si un ticket n'est pas sélectionné ou si on est en train de traiter
                    >
                        {processing ? (
                            <Spin size="small" /> // Affiche un spinner pendant le traitement
                        ) : (
                            `Confirm Registration ${selectedTicketPrice ? `(${selectedTicketPrice} €)` : ""}`
                        )}
                    </Button>
                </motion.div>

                {/* Section de droite : Détails de l'événement */}
                <motion.div
                    className="w-full md:w-1/3 bg-white p-6 border border-gray-200 shadow-lg rounded-xl"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">{event.title}</h2>
                    <div className="overflow-hidden rounded-lg mb-6">
                        {event.images.length > 0 && (
                            <Image
                            src={event.images[0]}
                            alt={event.title}
                            width={500}
                            height={300}
                            className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                            />
                        )}
                    </div>

                    <div className="flex flex-col gap-2 text-gray-600">
                        <div className="flex items-center mb-2">
                            <LuCalendarDays className="mr-2 text-blue-500" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center">
                            <IoLocationOutline className="mr-2 text-green-500" />
                            <span>{event.place}</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
            <Footer />
        </>
    );
};

export default Page;
