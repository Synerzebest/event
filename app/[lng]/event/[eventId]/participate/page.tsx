"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer, EventComponent } from "@/components";
import { Spin, Button, message, Select } from 'antd';
import useFirebaseUser from '@/lib/useFirebaseUser';
import { Ticket } from "@/types/types";
import { loadStripe } from '@stripe/stripe-js';
import { motion } from "framer-motion";
import useLanguage from "@/lib/useLanguage";
import { useRouter } from "next/navigation";
import { safeTranslate } from "@/lib/utils";
import { useTranslation } from "@/app/i18n";

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
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const { user } = useFirebaseUser();
    const userId = user?.uid || "";
    const userEmail = user?.email || "";
    const router = useRouter();
    const [processing, setProcessing] = useState<boolean>(false);
    const lng = useLanguage();
    const { t } = useTranslation(lng, "common");

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

        if (!firstName.trim() || !lastName.trim()) {
            message.error(safeTranslate(t, "name_required"));
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
                        firstName,
                        lastName,
                        userEmail
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
                    firstName,
                    lastName,
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

    return (
        <>
            <Navbar lng={lng} />
            <motion.div
                className="relative top-16 sm:top-36 flex flex-col md:flex-row w-[98%] items-center w-11/12 mx-auto gap-8 pt-10"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <motion.div
                    className="w-full md:w-2/3 flex flex-col border border-gray-200 rounded-2xl bg-gray-50 p-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h3 className="text-3xl font-semibold mb-6 text-gray-800">{safeTranslate(t, "buy_ticket")}</h3>

                    {/* Choix du ticket */}
                    <div className="flex flex-col w-full mb-8">
                        <label className="text-lg font-medium text-gray-600 mb-2">{safeTranslate(t, "choose_ticket")}</label>
                        <Select
                            placeholder="Sélectionner un ticket"
                            value={selectedTicket}
                            onChange={handleTicketChange}
                            className="rounded-md focus:ring focus:ring-blue-500"
                            size="large"
                        >
                            {event.tickets.map((ticket) => (
                                <Select.Option key={ticket.name} value={ticket.name} disabled={ticket.quantity <= 0}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span>{ticket.name}</span>
                                            <span className="text-gray-500">({ticket.price}€)</span>
                                        </div>
                                    <span className="text-gray-500">
                                        {ticket.quantity > 0 ? `${ticket.quantity} ${safeTranslate(t, "available")}` : safeTranslate(t, "sold_out")}
                                    </span>
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="text-lg font-medium text-gray-600 mb-2 block">{safeTranslate(t, "first_name")}</label>
                            <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                            required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-lg font-medium text-gray-600 mb-2 block">{safeTranslate(t, "last_name")}</label>
                            <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring focus:ring-blue-500"
                            required
                            />
                        </div>
                    </div>


                    <Button
                        type="default"
                        className="w-full py-4 mt-4 bg-indigo-500 border border-indigo-500 hover:!bg-indigo-600 hover:!text-white hover:!border-none text-white font-semibold transition-all rounded-lg duration-300"
                        size="large"
                        onClick={handleCheckout}
                        disabled={!selectedTicket || processing} // Désactive le bouton si un ticket n'est pas sélectionné ou si on est en train de traiter
                    >
                        {processing ? (
                            <Spin size="small" /> // Affiche un spinner pendant le traitement
                        ) : (
                            `${safeTranslate(t, "confirm_registration")} ${selectedTicketPrice ? `(${selectedTicketPrice} €)` : ""}`
                        )}
                    </Button>
                </motion.div>

                <EventComponent eventId={eventId} participateButton={false} />
            </motion.div>
            <Footer />
        </>
    );
};

export default Page;
