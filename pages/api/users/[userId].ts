import { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/lib/firebaseAdmin";
import { db } from "@/lib/firebaseConfig"; 
import { doc, getDoc } from "firebase/firestore"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: `Method ${req.method} not allowed.` });
    }

    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "userId not provided" });
    }

    try {
        // Obtenir les infos Firebase Auth
        const userRecord = await auth.getUser(userId as string);
        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }

        const { displayName, photoURL, email, uid } = userRecord;

        const userDocRef = doc(db, 'users', userId as string);
        const userSnap = await getDoc(userDocRef);

        let likedEvents: string[] = [];

        if (userSnap.exists()) {
            const userData = userSnap.data();
            likedEvents = userData.likedEvents || [];
        }

        // Retourne les infos fusionnées
        res.status(200).json({
            name: displayName,
            imageUrl: photoURL,
            userId: uid,
            email: email,
            likedEvents, 
        });

    } catch (error) {
        console.error("An error occurred while fetching user details", error);
        res.status(500).json({ message: "Error while fetching user details" });
    }
}
