import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc, deleteField } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-09-30.acacia"
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed." });
    }
    
    const { subscriptionId, userId } = req.body;

    if (!subscriptionId || !userId) {
        return res.status(400).json({ error: "Missing subscriptionId or userId." });
    }

    try {
        // Annulation de l'abonnement via Stripe
        const deletedSubscription = await stripe.subscriptions.cancel(subscriptionId);

        // Si l'annulation est réussie, mettre à jour Firestore
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, {
            subscriptionId: deleteField()  // Utilise deleteField() pour supprimer le champ
        });

        res.status(200).json({ success: true, subscription: deletedSubscription });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
}
