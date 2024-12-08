import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';

async function getOrganizerStripeAccountId(eventId: string): Promise<string> {
  try {
    // Récupérer les détails de l'événement pour obtenir l'ID de l'organisateur
    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const organizerUserId = eventDoc.data()?.createdBy;

    if (!organizerUserId) {
      throw new Error('Organizer user ID not found');
    }

    // Récupérer l'ID Stripe Connect de l'organisateur à partir de la collection users
    const userRef = firestore.collection('users').doc(organizerUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const stripeAccountId = userDoc.data()?.stripeAccountId;

    if (!stripeAccountId) {
      throw new Error('Stripe account ID not found for the user');
    }

    return stripeAccountId;
  } catch (error) {
    console.error('Error fetching organizer Stripe account ID:', error);
    throw error;
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { ticket, userId, eventId } = req.body;

  try {
    // Récupérer l'ID du compte Stripe Connect de l'organisateur
    const organizerStripeAccountId = await getOrganizerStripeAccountId(eventId);

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: ticket.name,
            },
            unit_amount: Math.round(ticket.price * 100), // prix en centimes
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: Math.round(ticket.price * 100 * 0.1), // 10% de commission pour vous
        transfer_data: {
          destination: organizerStripeAccountId, // ID du compte Stripe Connect de l'organisateur
        },
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&eventId=${eventId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    // Retourner l'ID de la session de paiement à l'utilisateur
    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'An error occurred while creating the checkout session.' });
  }
}

