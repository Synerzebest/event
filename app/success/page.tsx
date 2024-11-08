"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar, EventComponent, Footer } from '@/components';
import { useUser } from "@clerk/nextjs";
import { message } from 'antd';
import Link from "next/link";

const PaymentSuccess = () => {
    const searchParams = useSearchParams();
    const sessionId = searchParams ? searchParams.get('session_id') : null;
    const eventId = searchParams ? searchParams.get('eventId') : null;
    const { user } = useUser();
    const userId = user?.id || "";
    const [hasUpdated, setHasUpdated] = useState(false);

    useEffect(() => {
        const fetchStripeSessionDetails = async () => {
            if (!sessionId || !eventId || hasUpdated) return; // Vérifier si la sessionId et eventId sont présents et si la mise à jour a déjà été effectuée

            const storageKey = `updated_${sessionId}_${eventId}`;

            // Vérifiez si l'événement a déjà été mis à jour
            if (localStorage.getItem(storageKey)) {
                setHasUpdated(true); // Si déjà mis à jour, mettez à jour le statut et arrêtez
                return;
            }

            try {
                const sessionResponse = await fetch(`/api/get-stripe-session-details?session_id=${sessionId}`);
                if (!sessionResponse.ok) {
                    message.error('Erreur lors de la récupération des détails de la session.');
                    return;
                }

                const sessionData = await sessionResponse.json();
                const selectedTicket = sessionData.metadata.selectedTicket;

                if (sessionData.payment_status === "paid") {
                    await updateEvent(selectedTicket, storageKey);
                }
            } catch (error) {
                console.error("Erreur:", error);
            }
        };
        fetchStripeSessionDetails();
    }, [sessionId, eventId]); // N'incluez que les dépendances nécessaires

    const updateEvent = async (selectedTicket: string, storageKey: string) => {
        if (!selectedTicket || !eventId) return; // Assurez-vous que les données nécessaires sont présentes

        try {
            const updateResponse = await fetch('/api/update-guests-and-tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventId: eventId,
                    selectedTicket: selectedTicket,
                    userId: userId,
                }),
            });

            if (updateResponse.ok) {
                message.success('Everything went well, thanks for your trust');
                setHasUpdated(true); // Marquez la mise à jour comme effectuée
                localStorage.setItem(storageKey, "true"); // Enregistrez dans localStorage
            } else {
                message.error('Une erreur s\'est produite lors de la mise à jour de l\'événement.');
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'événement:", error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="w-11/12 md:w-[80%] relative top-12 mx-auto p-6 text-center border border-gray-300 rounded-lg shadow-lg bg-gray-50">
                <h1 className="text-2xl font-bold text-green-600">Merci pour votre achat !</h1>
                <p className="mt-4 text-lg text-gray-700 font-bold">
                    Votre paiement pour l'événement a été traité avec succès.
                </p>
                <p className="mt-2 text-lg text-gray-700 font-bold">
                    Thanks for your trust
                </p>

                <div className="mt-8 p-4 rounded-lg flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-4">Détails de l'événement</h2>
                    <EventComponent eventId={eventId!} userId={userId} participateButton={false} />
                </div>

                <div className="mt-4 mb-4">
                    <Link href="/" className="cursor-pointer hover:bg-blue-600 duration-300 bg-blue-500 font-bold py-4 px-6 text-white rounded-lg text-xl" >Back Home</Link>
                </div>  
            </div>
            <Footer />
        </>
    );
};

export default PaymentSuccess;
