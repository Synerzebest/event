import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, collection } from "@firebase/firestore";
import { DocumentData } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }

    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ message: "userId not provided" });
    }

    try {
        // 1. Récupère le document utilisateur
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
            return res.status(404).json({ message: "User not found" });
        }

        const userData = userDocSnap.data();
        const eventsCreated: string[] = userData.eventsCreated || [];
        const organizedEvents: string[] = userData.organizedEvents || [];
        const scannedEvents: string[] = userData.scannedEvents || [];

        const allEventIds = Array.from(new Set([
            ...eventsCreated,
            ...organizedEvents,
            ...scannedEvents
        ]));

        // 2. Récupère les événements correspondants
        const eventsCollection = collection(db, "events");

        const eventDocsPromises = allEventIds.map(id => getDoc(doc(eventsCollection, id)));
        const eventDocs = await Promise.all(eventDocsPromises);

        const userEvents = eventDocs
            .filter(doc => doc.exists())
            .map(doc => ({ id: doc.id, ...doc.data() as DocumentData }));

        return res.status(200).json(userEvents);

    } catch (error) {
        console.error("An error occurred while fetching user's events", error);
        return res.status(500).json({ message: "Error while fetching user's events" });
    }
}
