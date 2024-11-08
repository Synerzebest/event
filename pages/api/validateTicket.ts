import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc, updateDoc } from "@firebase/firestore";

export default async function validateTicket(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { ticketId, eventId } = req.body;

        try {
            // Référence au document du ticket
            const ticketRef = doc(collection(db, 'tickets'), ticketId);
            const ticketSnapshot = await getDoc(ticketRef);
            
            // Vérifiez d'abord si le ticket existe
            if (!ticketSnapshot.exists()) {
                return res.status(404).json({ message: 'Ticket not found' });
            }

            const ticketData = ticketSnapshot.data();

            // Vérifiez si le ticket est déjà utilisé
            if (ticketData?.used) {
                return res.status(400).json({ message: 'Ticket has already been used' });
            }

            // Vérifiez que l'eventId correspond
            if (ticketData?.eventId !== eventId) {
                return res.status(403).json({ message: 'This ticket does not belong to the current event' });
            }

            // Marquez le ticket comme utilisé
            await updateDoc(ticketRef, { used: true });

            return res.status(200).json({ message: 'Ticket validated successfully' });
        } catch (error) {
            console.error('Error validating ticket:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        // Méthode non autorisée
        return res.status(405).json({ message: 'Method not allowed' });
    }
}
