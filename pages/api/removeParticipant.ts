import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, getDoc } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { eventId, userId } = req.body;

    if (!eventId || !userId) {
        return res.status(400).json({ error: "eventId and userId are required." });
    }

    try {
        // Chercher le document dans event_participations
        const participationQuery = query(collection(db, "event_participations"), where("eventId", "==", eventId), where("userId", "==", userId));
        const participationSnapshot = await getDocs(participationQuery);

        if (participationSnapshot.empty) {
            return res.status(404).json({ error: "Participant not found." });
        }

        // Supprimer chaque document trouvé
        const deletePromises = participationSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Récupérer le document de l'événement pour décrémenter currentGuests
        const eventDocRef = doc(db, "events", eventId);
        const eventDoc = await getDoc(eventDocRef);
        
        if (eventDoc.exists()) {
            const currentGuests = eventDoc.data()?.currentGuests || 0; // Récupérer la valeur actuelle, défaut à 0
            await updateDoc(eventDocRef, {
                currentGuests: currentGuests - 1 // Décrémenter currentGuests
            });
        } else {
            return res.status(404).json({ error: "Event not found." });
        }

        res.status(200).json({ message: "Participant removed successfully." });
    } catch (error) {
        console.error("Error removing participant:", error);
        res.status(500).json({ message: "Error removing participant." });
    }
}
