import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { Ticket } from "@/types/types";
import { db } from "@/lib/firebaseConfig"; 
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  try {
    const { ticket, userId, eventId }: { ticket: Ticket, userId: string, eventId: string } = req.body;

    // Validation des données du ticket
    if (!ticket || !userId || !eventId) {
      return res.status(400).json({ error: `Missing required fields. Ticket: ${ticket}, userId: ${userId}, eventId: ${eventId}`});
    }

    // Créer l'article de ligne pour Stripe
    const lineItem = {
      price_data: {
        currency: 'eur',
        product_data: {
          name: ticket.name,
        },
        unit_amount: Math.round(ticket.price * 100),
      },
      quantity: 1, // Un seul ticket acheté
    };

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}`, // Ajoutez eventId ici
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      metadata: {
        selectedTicket: ticket.name, // Ajoutez le nom du ticket ou tout autre identifiant pertinent
      },
    });

    // Enregistrer le ticket dans Firestore
    const ticketRecord = {
      ticketId: uuidv4(),
      eventId,
      userId,
      name: ticket.name,
      price: ticket.price,
      quantity: 1, // Un seul ticket
      used: false, // Ou 'non utilisé' si vous préférez
      purchaseDate: new Date(),
    };

    await addDoc(collection(db, 'tickets'), ticketRecord);

    // Réponse de succès
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    res.status(500).json({ message: error instanceof Error ? error.message : "An error occurred while creating the payment session" });
  }
}
