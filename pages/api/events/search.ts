import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs } from '@firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { searchTerm, category } = req.query;

    try {
        const q = collection(db, 'events'); // Collection d'événements
        const querySnapshot = await getDocs(q);
        const events: any[] = [];

        querySnapshot.forEach((doc) => {
            events.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // Filtrer par catégorie si spécifiée
        let filteredEvents = events;
        if (category) {
            filteredEvents = filteredEvents.filter(event => event.category === category);
        }

        // Filtrer par sous-chaîne dans le titre et le lieu
        if (typeof searchTerm === 'string' && searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            filteredEvents = filteredEvents.filter(event =>
                event.title.toLowerCase().includes(lowercasedTerm) || 
                event.place.toLowerCase().includes(lowercasedTerm) // Recherche dans le champ "place"
            );
        }

        res.status(200).json(filteredEvents);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des événements', error });
    }
}
