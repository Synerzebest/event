import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, doc, getDoc } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { ids } = req.body; // Récupère les IDs du corps de la requête

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "No IDs provided." });
    }

    try {
        // Collection des événements
        const eventsCollection = collection(db, "events");

        // Récupérer les événements par ID
        const eventsList = await Promise.all(
            ids.map(async (id: string) => {
                const eventDoc = doc(eventsCollection, id);
                const eventSnapshot = await getDoc(eventDoc);
                if (eventSnapshot.exists()) {
                    return { id: eventSnapshot.id, ...eventSnapshot.data() };
                }
                return null; // Si l'événement n'existe pas, retourne null
            })
        );

        // Filtrer les résultats pour ne garder que les événements trouvés
        const filteredEvents = eventsList.filter(event => event !== null);

        res.status(200).json(filteredEvents);
    } catch (error) {
        console.error("Error fetching events by IDs:", error);
        res.status(500).json({ message: "Error fetching events" });
    }
}
