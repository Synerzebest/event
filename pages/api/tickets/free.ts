import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebaseAdmin';
import { sendConfirmationEmail } from "@/lib/email";
import admin from "firebase-admin";

interface Ticket {
    name: string;
    quantity: number;
    sold: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Unauthorized Metho' });
    }

    const { eventId, ticketName, userId, firstName, lastName, userEmail } = req.body;

    if (!eventId || !ticketName || !userId || !userEmail) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const eventRef = firestore.collection('events').doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const eventData = eventDoc.data();
        const tickets = eventData?.tickets;
        const currentGuests = eventData?.currentGuests || 0;

        if (!tickets) {
            return res.status(400).json({ message: 'No tickets available for this event' });
        }

        const ticket = tickets.find((t: Ticket) => t.name === ticketName);

        if (!ticket) {
            return res.status(404).json({ message: `Ticket "${ticketName}" not found.` });
        }

        if (ticket.quantity <= 0) {
            return res.status(400).json({ message: `Ticket "${ticketName}" sold out.` });
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
            eventId,
            name: ticketName,
            price: 0,
            purchaseDate: admin.firestore.Timestamp.now(),
            used: false,
            userId,
            firstName,
            lastName,
        };

        // Enregistrement du ticket dans la collection "tickets"
        const ticketRef = firestore.collection('tickets').doc();
        await ticketRef.set(ticketData);

        await sendConfirmationEmail({
            email: userEmail,
            firstName,
            lastName,
            ticketId: ticketRef.id,
            eventId: eventId
        })

        return res.status(200).json({ message: 'Ticket gratuit réservé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la gestion des tickets gratuits:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
}
