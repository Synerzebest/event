import { db } from "@/lib/firebaseConfig";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/firebaseAdmin"; // Importer le service auth de firebaseAdmin

interface Ticket {
    id: string;
    userId: string;
    eventId: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Ticket[] | { error: string }>) {
    if (req.method != "GET") {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Récupérer le token depuis l'en-tête Authorization
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Token manquant" });
    }

    try {
        // Vérifier et décoder le token
        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;  // Extraire l'UID de l'utilisateur depuis le token
        console.log("UID décodé depuis le token :", uid);

        // Effectuer la requête Firestore pour récupérer les tickets de l'utilisateur
        const ticketsRef = collection(db, 'tickets');
        const q = query(ticketsRef, where("userId", "==", uid));
        const querySnapshot = await getDocs(q);

        const userTickets: Ticket[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        } as Ticket));

        return res.status(200).json(userTickets);
    } catch (error) {
        console.error("Error fetching user tickets", error);
        return res.status(500).json({ error: "Error fetching user tickets" });
    }
}
