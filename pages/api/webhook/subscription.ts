import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-12-18.acacia',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error(`Erreur de validation du webhook : ${err instanceof Error ? err.message : 'Unknown error'}`);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (subscriptionId) {
        try {
          await updateUserSubscription(customerId, subscriptionId);
          console.log(`Abonnement ${subscriptionId} ajouté pour le client ${customerId}.`);
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de l'abonnement : ${error.message}`);
        }
      }
      break;
    }
    default:
      console.log(`Événement non pris en charge: ${event.type}`);
  }

  res.status(200).json({ received: true });
}

async function updateUserSubscription(customerId: string, subscriptionId: string) {
  try {
    const usersRef = firestore.collection('users');
    const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

    if (querySnapshot.empty) {
      throw new Error(`Utilisateur avec customerId ${customerId} non trouvé.`);
    }

    const userDoc = querySnapshot.docs[0];
    await userDoc.ref.update({ subscriptionId: subscriptionId });

    console.log(`Mise à jour réussie pour l'utilisateur ${userDoc.id} avec l'abonnement ${subscriptionId}`);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur : ${error.message}`);
    throw error;
  }
}
