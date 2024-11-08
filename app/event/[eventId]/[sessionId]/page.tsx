"use client"

import { useParams } from "next/navigation"; 
import { NextPage } from 'next';
import { Navbar, EventComponent, Footer } from '@/components';
import { useUser } from "@clerk/nextjs";

const PaymentSuccess: NextPage = () => {
    const { eventId, sessionId } = useParams() as { eventId: string, sessionId: string };
    const { user } = useUser();
    const userId = user?.id || "";

    return (
        <>
            <Navbar />

            <div className="w-11/12 md:w-[80%] relative top-12 mx-auto p-6 text-center border border-gray-300 rounded-lg shadow-lg bg-gray-50">
                <h1 className="text-2xl font-bold text-green-600">Merci pour votre achat !</h1>
                <p className="mt-4 text-lg text-gray-700">
                    Votre paiement pour l'événement <strong className="text-gray-900">{eventId}</strong> a été traité avec succès.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                    Session ID: <strong className="text-gray-900">{sessionId}</strong>
                </p>
                <p className="mt-2 text-sm text-gray-600">Vous recevrez bientôt un e-mail de confirmation.</p>

                <div className="mt-8 p-4 rounded-lg flex flex-col items-center">
                    <h2 className="text-xl font-semibold mb-4">Détails de l'événement</h2>
                    <EventComponent eventId={eventId} userId={userId} />
                </div>
            </div>

            <Footer />
        </>
    );
};

export default PaymentSuccess;
