import type { NextApiRequest, NextApiResponse } from "next";
import { firestore, auth } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

type EventData = {
    title: string;
    city: string;
    place: string;
    date: string;
    dateTimestamp: number;
    description: string;
    guestLimit: number;
    privacy: 'public' | 'private';
    category: string;
    organizers: string[];
    tickets: Ticket[];
    images: string[];
};

type Ticket = {
    name: string;
    price: number | null;
    quantity: number;
    sold: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authorization header missing or invalid." });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const eventData: EventData = req.body;

        // Validation plus stricte
        if (!eventData.title || !eventData.city || !eventData.place || !eventData.date || 
            !eventData.description || !eventData.category || !eventData.organizers || 
            !Array.isArray(eventData.tickets) || !Array.isArray(eventData.images)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Création d'objet safe (propre et contrôlé)
        const eventToInsert = {
            title: eventData.title,
            city: eventData.city,
            place: eventData.place,
            date: eventData.date,
            dateTimestamp: eventData.dateTimestamp,
            description: eventData.description,
            guestLimit: eventData.guestLimit,
            privacy: eventData.privacy,
            category: eventData.category,
            organizers: [userId],
            tickets: eventData.tickets,
            images: eventData.images,
            createdAt: new Date().toISOString(),
            currentGuests: 0,
            createdBy: userId,
        };

        const eventRef = await firestore.collection("events").add(eventToInsert);

        const userRef = firestore.collection("users").doc(userId);
        await userRef.set({
            eventsCreated: admin.firestore.FieldValue.arrayUnion(eventRef.id)
        }, { merge: true });

        res.status(201).json({ message: "Event created successfully", eventId: eventRef.id });

    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Internal Server Error" });
    }
}
