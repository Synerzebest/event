import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

type EventData = {
    title: string;
    place: string;
    date: string;
    description: string;
    guestLimit: number;
    privacy: 'public' | 'private';
    photos?: string[];
    category: string;
    organizers: string[];
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    try {
        const eventData: EventData = req.body;

        // Validation des champs obligatoires de l'événement
        if (!eventData.title || !eventData.place || !eventData.date || !eventData.description || !eventData.category || !eventData.organizers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Ajouter l'événement à Firestore
        const docRef = await addDoc(collection(db, 'events'), {
            ...eventData,
            createdAt: new Date().toISOString(),
            currentGuests: 0,
        });

        // Réponse de succès
        res.status(201).json({ message: "Event created successfully", eventId: docRef.id });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while creating the event" });
    }
}