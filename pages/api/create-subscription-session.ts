import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const { priceId, userId } = req.body; // `priceId` correspond à l'ID du prix de Stripe pour l'abonnement.

  if (!priceId) {
    console.error('Missing priceId in the request body');
    return res.status(400).json({ error: 'Missing priceId' });
  }

  try {
    // Récupérer l'utilisateur dans Firestore pour vérifier s'il a déjà un Stripe Customer ID
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    let customerId = userDoc.exists ? userDoc.data()?.stripeCustomerId : null;

    if (!customerId) {
      // Si l'utilisateur n'a pas de `stripeCustomerId`, créer un nouveau Customer dans Stripe
      const customer = await stripe.customers.create({
        email: userDoc.data()?.email, // Tu peux ajouter l'email de l'utilisateur Firebase ici
        metadata: {
          firebaseUserId: userId, // Lier le customer à l'utilisateur Firebase
        },
      });

      // Mettre à jour Firestore avec le `customerId` de Stripe
      await userRef.update({
        stripeCustomerId: customer.id,
      });

      customerId = customer.id; // Assigner le customerId nouvellement créé
    }

    // Créer la session de paiement pour l'abonnement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
      customer: customerId, // Lier le Customer Stripe à la session de paiement
      metadata: {
        user_id: userId, // Optionnel, mais utile pour identifier l'utilisateur
      },
    });

    // Retourner l'ID de la session de paiement à l'utilisateur
    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session for subscription:', error);
    res.status(500).json({ error: 'An error occurred while creating the checkout session for subscription.' });
  }
}
