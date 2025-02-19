import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';

async function getOrganizerDetails(eventId: string): Promise<{ stripeAccountId: string, subscriptionId: string }> {
  try {
    // Get event details
    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const organizerUserId = eventDoc.data()?.createdBy;

    if (!organizerUserId) {
      throw new Error('Organizer user ID not found');
    }

    // Get event organizer from users collection
    const userRef = firestore.collection('users').doc(organizerUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const stripeAccountId = userDoc.data()?.stripeAccountId;
    const subscriptionId = userDoc.data()?.subscriptionId;

    if (!stripeAccountId) {
      throw new Error('Stripe account ID not found for the user');
    }

    return { stripeAccountId, subscriptionId };
  } catch (error) {
    console.error('Error fetching organizer Stripe account ID:', error);
    throw error;
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { ticket, eventId, userId } = req.body;

  try {
    if (ticket.price === 0) {
      // Pas de gestion Stripe pour les événements gratuits
      return res.status(200).json({
        message: 'This event is free. No payment session needed.',
      });
    }

    // Récupérer les détails de l'organisateur
    const { stripeAccountId, subscriptionId } = await getOrganizerDetails(eventId);

    let applicationFeePercentage = 0.15; // Par défaut pour 'starter'

    if (subscriptionId) {
      // Récupérer les détails de l'abonnement via Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan = subscription.items.data[0].price.metadata.nickname || 'starter';

      if (plan.toLowerCase() === 'premium') {
        applicationFeePercentage = 0.05; // Premium : 5%
      } else if (plan.toLowerCase() === 'pro') {
        applicationFeePercentage = 0.01; // Pro : 1%
      }
    } else {
      console.log('Organizer has starter plan (no plan found).');
    }


    // Créer une session de paiement avec Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: ticket.name,
            },
            unit_amount: Math.round(ticket.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        event_id: eventId,
        ticket_name: ticket.name,
        ticket_quantity: ticket.quantity,
        user_id: userId
      },
      payment_intent_data: {
        application_fee_amount: Math.round(ticket.price * 100 * applicationFeePercentage),
        transfer_data: {
          destination: stripeAccountId, // ID du compte Stripe Connect de l'organisateur
        },
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success/${eventId}?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'An error occurred while creating the checkout session.' });
  }
}

