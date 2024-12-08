import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Vérifier la méthode de la requête
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }

    // Récupérer le userId depuis les paramètres de la requête
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "userId not provided" });
    }

    try {
        // Récupérer les détails de l'utilisateur via Firebase
        const userRecord = await auth.getUser(userId as string);

        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }

        const { displayName, photoURL, email, uid } = userRecord;

        // Retourner les détails de l'utilisateur
        res.status(200).json({ name: displayName, imageUrl: photoURL, userId: uid, email: email });

    } catch (error) {
        console.error("An error occurred while fetching user details", error);
        res.status(500).json({ message: "Error while fetching user details" });
    }
}
