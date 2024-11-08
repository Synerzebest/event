import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }

    const eventId = req.query.eventId as string; // Récupère l'eventId depuis les paramètres de requête

    if (!eventId) {
        return res.status(400).json({ message: "eventId not provided" });
    }

    try {
        const participantsCollection = collection(db, "event_participations");

        // Query pour récupérer les participants de l'événement avec eventId
        const q = query(participantsCollection, where("eventId", "==", eventId));
        const querySnapshot = await getDocs(q);

        const participants = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(participants);

    } catch (error) {
        console.error("An error occurred while fetching event participants", error);
        res.status(500).json({ message: "Error while fetching event participants" });
    }
}
