import { NextApiRequest, NextApiResponse } from 'next';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from "@/lib/firebaseConfig";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { userId, eventId } = req.body;

    if (!userId || !eventId) {
        return res.status(400).json({ error: 'Missing userId or eventId' });
    }

    try {
        // Récupérer l'utilisateur depuis Firestore
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        let likedEvents: string[] = [];

        if (userSnap.exists()) {
            const userData = userSnap.data();
            likedEvents = userData.likedEvents || [];
        }

        // Vérifier si l'événement est déjà liké
        if (likedEvents.includes(eventId)) {
            return res.status(200).json({ message: 'Event already liked' });
        }

        // Ajouter l'eventId au tableau
        likedEvents.push(eventId);

        // Mettre à jour Firestore
        await setDoc(userRef, { likedEvents }, { merge: true });

        return res.status(200).json({ message: 'Event liked successfully' });

    } catch (error) {
        console.error('Error liking event:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
