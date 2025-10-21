import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';

async function getOrganizerDetails(eventId: string): Promise<{ stripeAccountId: string; subscriptionId: string }> {
  try {
    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new Error('Event not found');
    }

    const organizerUserId = eventDoc.data()?.createdBy;
    if (!organizerUserId) throw new Error('Organizer user ID not found');

    const userRef = firestore.collection('users').doc(organizerUserId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) throw new Error('User not found');

    const stripeAccountId = userDoc.data()?.stripeAccountId;
    const subscriptionId = userDoc.data()?.subscriptionId;

    if (!stripeAccountId) throw new Error('Stripe account ID not found for organizer');

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

  const { ticket, eventId, userId, userEmail, firstName, lastName } = req.body;

  try {
    if (!ticket || !eventId || !firstName || !lastName || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Si le ticket est gratuit → pas de paiement
    if (ticket.price === 0) {
      return res.status(200).json({
        message: 'This event is free. No payment session needed.',
      });
    }

    // --- Récupération des détails de l'organisateur ---
    const { stripeAccountId, subscriptionId } = await getOrganizerDetails(eventId);

    // --- Calcul des frais selon le plan ---
    let applicationFeePercentage = 0.07; // Starter par défaut
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan = subscription.items.data[0].price.metadata.nickname || 'starter';
      if (plan.toLowerCase() === 'standard') {
        applicationFeePercentage = 0.05;
      } else if (plan.toLowerCase() === 'pro') {
        applicationFeePercentage = 0.03;
      }
    }

    // --- Création ou réutilisation du customer Stripe ---
    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: userEmail,
        name: `${firstName} ${lastName}`,
        metadata: {
          event_id: eventId,
          is_guest: userId ? "false" : "true",
        },
      });
      customerId = newCustomer.id;
    }

    // --- Création de la session Stripe Checkout ---
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
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
        user_id: userId || 'guest',
        first_name: firstName,
        last_name: lastName,
        email: userEmail,
        is_guest: userId ? "false" : "true",
      },
      payment_intent_data: {
        application_fee_amount: Math.round(ticket.price * 100 * applicationFeePercentage),
        transfer_data: {
          destination: stripeAccountId,
        },
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success/${eventId}?sessionId={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
    });

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', JSON.stringify(error, null, 2));
    return res.status(500).json({ error: 'An error occurred while creating the checkout session.' });
  }
}
