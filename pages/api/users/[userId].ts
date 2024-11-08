import { NextApiRequest, NextApiResponse } from "next";
import { clerkClient } from "@clerk/nextjs/server"; // Assurez-vous d'importer clerkClient

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
        // Récupérer les détails de l'utilisateur à partir de Clerk
        const user = await clerkClient.users.getUser(userId as string);

        // Vérifier si l'utilisateur existe
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extraire les détails nécessaires
        const { fullName, imageUrl, emailAddresses } = user;

        // Retourner les détails de l'utilisateur
        res.status(200).json({ name: fullName, imageUrl, userId, mail: emailAddresses });

    } catch (error) {
        console.error("An error occurred while fetching user details", error);
        res.status(500).json({ message: "Error while fetching user details" });
    }
}
