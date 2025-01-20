import { db } from '@/lib/firebaseConfig';
import { doc, runTransaction } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Ticket } from "@/types/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { eventId, selectedTicket } = req.body;

        // Vérification des champs requis
        if (!eventId || !selectedTicket) {
            return res.status(400).json({ error: 'Missing required fields: eventId or selectedTicket' });
        }

        try {
            const eventRef = doc(db, 'events', eventId);

            // Exécuter la transaction pour garantir l'intégrité des données
            await runTransaction(db, async (transaction) => {
                const eventDoc = await transaction.get(eventRef);

                if (!eventDoc.exists()) {
                    throw new Error('Event not found');
                }

                const eventData = eventDoc.data();
                const currentGuests = eventData.currentGuests || 0;
                const updatedGuests = currentGuests + 1;

                // Définir le type des tickets dans eventData
                const tickets: Ticket[] = eventData.tickets || [];

                // Trouver le ticket correspondant
                const ticketIndex = tickets.findIndex(t => t.name === selectedTicket);
                if (ticketIndex === -1) {
                    throw new Error('Ticket not found');
                }

                const ticket = tickets[ticketIndex];
                const updatedQuantity = ticket.quantity - 1;
                
                // Vérifier si des tickets sont encore disponibles
                if (updatedQuantity < 0) {
                    throw new Error('Not enough tickets available');
                }

                // Incrémenter le champ "sold" du ticket
                const updatedSold = ticket.sold + 1;

                // Mettre à jour les tickets avec la quantité décrémentée et sold incrémenté
                const updatedTickets = tickets.map((t, index) => 
                    index === ticketIndex 
                        ? { ...t, quantity: updatedQuantity, sold: updatedSold } 
                        : t
                );

                // Mettre à jour `currentGuests` et les tickets dans Firestore via transaction
                transaction.update(eventRef, {
                    currentGuests: updatedGuests,
                    tickets: updatedTickets,
                });
            });

            return res.status(200).json({ success: true, message: "Ticket sold successfully" });
        } catch (error) {
            console.error('Error updating event:', error);
            return res.status(500).json({ error: 'Error updating event', details: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
