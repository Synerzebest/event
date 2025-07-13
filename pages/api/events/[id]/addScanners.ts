import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../../lib/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { id } = req.query;
    const { scanners } = req.body;

    try {
        if (!Array.isArray(scanners) || scanners.length === 0) {
            return res.status(400).json({ error: 'No scanners provided' });
        }

        const eventRef = doc(db, 'events', id as string);

        // 1. Ajouter les scanners à l'événement
        await updateDoc(eventRef, {
            scanners: arrayUnion(...scanners),
        });

        // 2. Pour chaque organisateur, ajouter l'event à son profil
        const updatePromises = scanners.map(async (scannerId) => {
            const userRef = doc(db, 'users', scannerId);
            await updateDoc(userRef, {
                scannedEvents: arrayUnion(id),
            });
        });

        await Promise.all(updatePromises);

        res.status(200).json({ message: "Scanners added successfully" });
    } catch (error) {
        console.error('Error adding scanners:', error);
        res.status(500).json({ message: "An error occurred while adding scanners" });
    }
}
