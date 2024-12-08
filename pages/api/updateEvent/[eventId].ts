import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "PUT") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { eventId } = req.query;
    if (!eventId || typeof eventId !== "string") {
        return res.status(400).json({ message: "Invalid event ID" });
    }

    try {
        const data = req.body; 

        const eventRef = doc(db, "events", eventId);
        await updateDoc(eventRef, data);

        res.status(200).json({ message: "Event updated successfully" });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Failed to update event", error });
    }
}
