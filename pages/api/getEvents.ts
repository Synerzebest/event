import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }

    try {
        const eventsCollection = collection(db, "events");

        // Query pour récupérer les événements avec privacy == "public"
        const q = query(eventsCollection, where("privacy", "==", "public"));
        const querySnapshot = await getDocs(q);

        const publicEvents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(publicEvents);

    } catch (error) {
        console.error("An error occurred while fetching public events", error);
        res.status(500).json({ message: "Error while fetching public events" });
    }
}
