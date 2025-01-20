import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { eventId, ticketName, userId } = req.body;

    if (!eventId || !ticketName || !userId) {
        return res.status(400).json({ message: 'Les paramètres requis sont manquants.' });
    }

    try {
        const eventRef = firestore.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }

        const eventData = eventDoc.data();
        const tickets = eventData?.tickets;
        const currentGuests = eventData?.currentGuests || 0;

        if (!tickets) {
            return res.status(400).json({ message: 'Aucun ticket disponible pour cet événement.' });
        }

        const ticket = tickets.find((t: any) => t.name === ticketName);

        if (!ticket) {
            return res.status(404).json({ message: `Ticket "${ticketName}" introuvable.` });
        }

        if (ticket.quantity <= 0) {
            return res.status(400).json({ message: `Le ticket "${ticketName}" est épuisé.` });
        }

        // Mise à jour des données de l'événement
        ticket.quantity -= 1;
        ticket.sold += 1;
        const updatedGuests = currentGuests + 1;

        await eventRef.update({
            tickets,
            currentGuests: updatedGuests,
        });

        // Ajout du ticket dans la collection "tickets" pour l'utilisateur
        const ticketData = {
            eventId: eventId,
            name: ticketName,
            price: 0, // Prix du ticket gratuit
            purchaseDate: new Date().toISOString(), // Date de l'achat
            used: false, // Le ticket n'est pas utilisé par défaut
            userId: userId, // ID de l'utilisateur qui a réservé le ticket
        };

        // Enregistrement du ticket dans la collection "tickets"
        const ticketRef = firestore.collection('tickets').doc();
        await ticketRef.set(ticketData);

        return res.status(200).json({ message: 'Ticket gratuit réservé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la gestion des tickets gratuits:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
}
