import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { id } = req.query;
    const { organizers } = req.body;

    try {
        if (!Array.isArray(organizers) || organizers.length === 0) {
            return res.status(400).json({ error: 'No organizers provided' });
        }

        const eventRef = doc(db, 'events', id as string);

        // 1. Ajouter les organisateurs à l'événement
        await updateDoc(eventRef, {
            organizers: arrayUnion(...organizers),
        });

        // 2. Pour chaque organisateur, ajouter l'event à son profil
        const updatePromises = organizers.map(async (organizerId) => {
            const userRef = doc(db, 'users', organizerId);
            await updateDoc(userRef, {
                organizedEvents: arrayUnion(id),
            });
        });

        await Promise.all(updatePromises);

        res.status(200).json({ message: "Organizers added successfully" });
    } catch (error) {
        console.error('Error adding organizers:', error);
        res.status(500).json({ message: "An error occurred while adding organizers" });
    }
}
