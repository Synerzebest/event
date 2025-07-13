import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { eventId, organizerId } = req.body;

    if (!eventId || !organizerId) {
        return res.status(400).json({ error: "eventId and organizerId are required." });
    }

    try {
        // Chercher le document de l'événement
        const eventDocRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventDocRef);

        if (!eventDoc.exists()) {
            return res.status(404).json({ error: "Event not found." });
        }

        // Récupérer les organisateurs actuels
        const organizers: string[] = eventDoc.data()?.organizers || []; // Spécifier le type ici

        // Vérifier si l'organisateur existe dans la liste
        if (!organizers.includes(organizerId)) {
            return res.status(404).json({ error: "Organizer not found in the event." });
        }

        // Supprimer l'organisateur de la liste
        const updatedOrganizers = organizers.filter((id: string) => id !== organizerId); // Spécifier le type de 'id'

        // Mettre à jour le document de l'événement
        await updateDoc(eventDocRef, {
            organizers: updatedOrganizers
        });

        res.status(200).json({ message: "Organizer removed successfully." });
    } catch (error) {
        console.error("Error removing organizer:", error);
        res.status(500).json({ message: "Error removing organizer." });
    }
}
