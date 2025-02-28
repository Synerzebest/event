'use client'

import { useState, useEffect } from 'react';
import useFirebaseUser from '@/lib/useFirebaseUser';
import { Navbar, Footer } from '@/components';
import useLanguage from '@/lib/useLanguage';
import Link from "next/link";
import { notification } from 'antd';

const CancelSubscription = () => {
    const lng = useLanguage();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isCanceled, setIsCanceled] = useState(false); // New state to track cancellation

    const { user } = useFirebaseUser();
    const userSubscriptionId = user?.subscriptionId;

    useEffect(() => {
        if (user && !userSubscriptionId && !isCanceled) {
            setMessage(lng === "fr" ? "Vous n'avez pas d'abonnement à résilier ou votre abonnement a déjà été résilié." : lng === "en" ? "You don't have any subscription to cancel or your subscription has already been canceled." : 'U heeft geen abonnement dat u kunt opzeggen of uw abonnement is al opgezegd.');
            setIsCanceled(true); // Update state to prevent further cancellation
        }
    }, [user, lng, userSubscriptionId, isCanceled]);

    const handleCancel = async () => {
        if (isCanceled) {
            return;
        }
    
        setLoading(true);
        setMessage('');
    
        try {
            const response = await fetch('/api/stripe/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    subscriptionId: userSubscriptionId || "", 
                    userId: user?.uid // Envoie l'ID utilisateur pour mettre à jour Firestore
                }),
            });
    
            const data = await response.json();
    
            if (data.success) {
                setMessage('Votre abonnement a été résilié avec succès.');
                setIsCanceled(true);
                // Show success notification
                notification.success({
                    message: lng === "fr" ? 'Abonnement résilié' : lng === "en" ? 'Subscription canceled' : 'Abonnement geannuleerd',
                    description: lng === "fr" ? 'Votre abonnement a été résilié avec succès.' : lng === "en" ? 'Your subscription has been successfully canceled.' : 'Uw abonnement is succesvol geannuleerd.',
                });
            } else {
                setMessage('Erreur lors de la résiliation de l’abonnement.');
                // Show error notification
                notification.error({
                    message: lng === "fr" ? 'Erreur' : lng === "en" ? 'Error' : 'Fout',
                    description: lng === "fr" ? 'Une erreur est survenue lors de la résiliation de votre abonnement.' : lng === "en" ? 'An error occurred while canceling your subscription.' : 'Er is een fout opgetreden bij het annuleren van uw abonnement.',
                });
            }
        } catch (error) {
            console.error(error);
            setMessage('Une erreur s’est produite.');
            // Show error notification
            notification.error({
                message: lng === "fr" ? 'Erreur' : lng === "en" ? 'Error' : 'Fout',
                description: lng === "fr" ? 'Une erreur est survenue.' : lng === "en" ? 'An error occurred.' : 'Er is een fout opgetreden.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar lng={lng} />
            {user?.subscriptionId && !isCanceled ? (
                <div className="relative top-36 height-64 flex flex-col items-center p-6">
                    <h1 className="text-2xl font-bold">{lng === "fr" ? 'Résilier votre abonnement' : lng === "en" ? 'Cancel your subscription' : 'Annuleer uw abonnement'}</h1>
                    <p className="mt-4">{lng === "fr" ? 'Êtes-vous sûr de vouloir résilier votre abonnement ?' : lng === "en" ? 'Are you sure you want to cancel your subscription?' : 'Weet je zeker dat je je abonnement wilt annuleren?'}</p>
                    <button
                        className={`mt-6 px-4 py-2 text-white bg-red-500 rounded ${loading ? 'opacity-50' : ''}`}
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        {loading ? (lng === "fr" ? 'Résiliation en cours...' : lng === "en" ? 'Cancelling...' : 'Annuleren...') : (lng === "fr" ? 'Résilier mon abonnement' : lng === "en" ? 'Cancel my subscription' : 'Annuleer mijn abonnement')}
                    </button>
                    {message && <p className="mt-4 text-gray-700">{message}</p>}
                </div>
            ) : (
                <div className="flex flex-col items-center p-6">
                    <p>{message || (lng === "fr" ? "Vous n'avez pas d'abonnement à résilier ou votre abonnement a déjà été résilié." : lng === "en" ? "You don't have any subscription to cancel or your subscription has already been canceled." : 'U heeft geen abonnement dat u kunt opzeggen of uw abonnement is al opgezegd.')}</p>
                    <Link href={`/${lng}/`} className="text-blue-500 underline text-xl">
                        {lng === "fr" ? 'Retour à l\'accueil' : lng === "en" ? 'Return to home' : 'Terug naar huis'}
                    </Link>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CancelSubscription;
