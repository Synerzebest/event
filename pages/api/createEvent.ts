import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth";

type EventData = {
    title: string;
    city: string;
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

    // Extraction du token Firebase Auth depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header missing or invalid." });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        // Vérification du token Firebase Auth
        const decodedToken = await getAuth().verifyIdToken(idToken);
        if (!decodedToken) {
            return res.status(401).json({ error: "Unauthorized." });
        }

        // Ajout de l'événement après validation
        const eventData: EventData = req.body;

        // Validation des champs obligatoires de l'événement
        if (!eventData.title || !eventData.city || !eventData.place || !eventData.date || !eventData.description || !eventData.category || !eventData.organizers) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Ajouter l'événement à Firestore
        const docRef = await addDoc(collection(db, 'events'), {
            ...eventData,
            createdAt: new Date().toISOString(),
            currentGuests: 0,
            createdBy: decodedToken.uid, // Ajout de l'ID de l'utilisateur qui a créé l'événement
        });

        // Réponse de succès
        res.status(201).json({ message: "Event created successfully", eventId: docRef.id });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : "An error occurred while creating the event" });
    }
}
