import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }

    const userId = req.query.userId as string; // Récupère l'userId depuis les paramètres de requête

    if (!userId) {
        return res.status(400).json({ message: "userId not provided" });
    }

    try {
        const eventsCollection = collection(db, "events");
        
        // Query pour récupérer les événements que l'utilisateur peut gérer
        const q = query(eventsCollection, where("organizers", "array-contains", userId));
        const querySnapshot = await getDocs(q);

        const userEvents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(userEvents);

    } catch (error) {
        console.error("An error occurred while fetching user's events", error);
        res.status(500).json({ message: "Error while fetching user's events" });
    }
}
