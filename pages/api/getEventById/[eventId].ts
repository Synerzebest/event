import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Vérifie si la méthode est GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { eventId } = req.query; // Récupère eventId depuis la route dynamique

    // Vérification si l'ID est valide
    if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ error: "No valid event ID provided." });
    }

    try {
        // Référence au document de l'événement
        const eventDoc = doc(db, "events", eventId);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
            // Retourne l'événement trouvé
            res.status(200).json({ id: eventSnapshot.id, ...eventSnapshot.data() });
        } else {
            // Si l'événement n'est pas trouvé, retourne une erreur 404
            res.status(404).json({ error: "Event not found." });
        }
    } catch (error) {
        console.error("Error fetching event by ID:", error);
        res.status(500).json({ message: "Error fetching event" });
    }
}
