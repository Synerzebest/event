import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "@firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    try {
        const eventsCollection = collection(db, "events");

        const currentDateISO = new Date().toISOString();

        const q = query(
            eventsCollection, 
            where("privacy", "==", "public"), 
            where("date", ">=", currentDateISO)
        );
        
        const eventsSnapshot = await getDocs(q);

        const eventsList = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(eventsList);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Error fetching events" });
    }
}
