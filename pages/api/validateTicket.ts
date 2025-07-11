import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc, updateDoc, Timestamp } from "@firebase/firestore";

const ALLOWED_DELAY_MS = 5000;

export default async function validateTicket(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { ticketId, eventId } = req.body;

    try {
        const ticketRef = doc(collection(db, 'tickets'), ticketId);
        const ticketSnapshot = await getDoc(ticketRef);

        if (!ticketSnapshot.exists()) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const ticketData = ticketSnapshot.data();
        const now = Timestamp.now();

        // Vérifie que l'événement correspond
        if (ticketData?.eventId !== eventId) {
            return res.status(403).json({ message: 'wrong_event' });
        }

        // Si déjà scanné récemment (< 5s), on tolère
        if (ticketData?.scannedAt) {
            const scannedAt = ticketData.scannedAt.toDate();
            const diffMs = now.toDate().getTime() - scannedAt.getTime();

            if (diffMs < ALLOWED_DELAY_MS) {
                return res.status(200).json({ message: 'Ticket validated (duplicate scan tolerated)' });
            }

            return res.status(400).json({ 
                message: 'already_used',
                scannedAt: scannedAt.toISOString() 
            });
        }

        // Première validation → update
        await updateDoc(ticketRef, {
            used: true,
            scannedAt: now,
        });

        return res.status(200).json({ message: 'Ticket validated successfully' });

    } catch (error) {
        console.error('Error validating ticket:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
