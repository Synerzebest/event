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
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        let likedEvents: string[] = [];

        if (userSnap.exists()) {
            const userData = userSnap.data();
            likedEvents = userData.likedEvents || [];
        }

        let updatedLikedEvents;

        if (likedEvents.includes(eventId)) {
            // 🔄 UNLIKE: Remove the eventId
            updatedLikedEvents = likedEvents.filter(id => id !== eventId);
            await setDoc(userRef, { likedEvents: updatedLikedEvents }, { merge: true });
            return res.status(200).json({ message: 'Event unliked successfully', liked: false });
        } else {
            // ❤️ LIKE: Add the eventId
            updatedLikedEvents = [...likedEvents, eventId];
            await setDoc(userRef, { likedEvents: updatedLikedEvents }, { merge: true });
            return res.status(200).json({ message: 'Event liked successfully', liked: true });
        }

    } catch (error) {
        console.error('Error toggling like:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
