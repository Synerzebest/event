import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: `Method ${req.method} not allowed.` });
    }

    const { id } = req.query; // Récupérer l'ID de l'événement à partir des paramètres de la requête
    const { organizers } = req.body; // Récupérer les organisateurs à ajouter depuis le corps de la requête

    try {
        // Validation des données
        if (!Array.isArray(organizers) || organizers.length === 0) {
            return res.status(400).json({ error: 'No organizers provided' });
        }

        // Mettre à jour l'événement en ajoutant les nouveaux organisateurs
        const eventRef = doc(db, 'events', id as string); // Référence à l'événement
        await updateDoc(eventRef, {
            organizers: arrayUnion(...organizers) // Ajouter les organisateurs en utilisant arrayUnion
        });

        // Réponse de succès
        res.status(200).json({ message: "Organizers added successfully" });
    } catch (error) {
        console.error('Error adding organizers:', error);
        res.status(500).json({ message: "An error occurred while adding organizers" });
    }
}
