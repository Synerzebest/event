import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2024-12-18.acacia',

});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const session_id = req.query.session_id as string;

    if (!session_id) {
        return res.status(400).json({ error: 'Session ID is required' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items', 'customer_details'],
        });

        res.status(200).json(session);
    } catch (error) {
        console.error('Error fetching session details:', error);
        res.status(500).json({ error: 'Unable to fetch session details' });
    }
}
