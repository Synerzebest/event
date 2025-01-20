import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({ error: "Missing customerId" });
    }

    try {
        // Récupérer les abonnements actifs du client
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId as string,
            status: 'all', // inclut les abonnements annulés
            limit: 1,
        });

        const activeSubscription = subscriptions.data.find(sub => sub.status === 'active' || sub.status === 'trialing');
        if (activeSubscription) {
            return res.status(200).json({ activePlan: activeSubscription.items.data[0].plan.id });
        }

        return res.status(200).json({ activePlan: null });
    } catch (error) {
        console.error("Error while checking subscription:", error);
        return res.status(500).json({ error: "Failed to check subscription status." });
    }
}
