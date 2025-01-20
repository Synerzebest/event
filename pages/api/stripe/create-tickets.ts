import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Ticket } from '@/types/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  try {
    const { tickets, eventId, userId }: { tickets: Ticket[], eventId: string, userId: string } = req.body;

    // Validation des données
    if (!tickets || tickets.length === 0 || !eventId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Créer un produit Stripe pour chaque ticket
    const stripeTickets = await Promise.all(
      tickets.map(async (ticket) => {
        // Créer un produit Stripe pour chaque ticket
        const product = await stripe.products.create({
          name: ticket.name,
          description: `Ticket for event: ${eventId}`,
        });

        // Créer un prix pour ce produit
        const price = await stripe.prices.create({
          unit_amount: Math.round(ticket.price * 100), // Prix en centimes
          currency: 'eur',
          product: product.id,
        });

        return { product, price };
      })
    );

    // Réponse de succès
    res.status(200).json({ message: 'Tickets created successfully on Stripe', tickets: stripeTickets });
  } catch (error) {
    console.error('Error creating tickets on Stripe:', error);
    res.status(500).json({
      message: error instanceof Error ? error.message : 'An error occurred while creating the tickets',
    });
  }
}
