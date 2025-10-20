import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebaseAdmin"; // ✅ on utilise ton admin Firestore

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifie que la méthode est GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { eventId } = req.query;

  // Vérifie la validité de l'ID
  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ error: "No valid event ID provided." });
  }

  try {
    // Récupération du document dans la collection "events"
    const eventRef = firestore.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return res.status(404).json({ error: "Event not found." });
    }

    // Retourne les données de l'événement
    return res.status(200).json({ id: eventSnap.id, ...eventSnap.data() });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return res.status(500).json({ message: "Error fetching event" });
  }
}
