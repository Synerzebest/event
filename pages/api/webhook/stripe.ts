import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';
import { Ticket } from "@/types/types";

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

      // Gestion du ticket
      if (session.metadata?.event_id && session.metadata?.ticket_name && session.metadata?.ticket_quantity) {
        await handleTicketPurchase(session);
      }

      // Gestion de l'abonnement
      if (session.subscription) {
        await handleSubscription(session);
      }

      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
  
      try {
          const usersRef = firestore.collection('users');
          const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();
  
          if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
  
              await userDoc.ref.update({
                  subscriptionId: null,
                  nickname: "starter",
              });
  
              console.log(`L'utilisateur ${userDoc.id} a annulé son abonnement. Réinitialisation à "starter".`);
          }
      } catch (error) {
          console.error("Erreur lors de la gestion de l'annulation d'abonnement:", error);
      }
      break;
  }  
    default:
      console.log(`Événement non pris en charge: ${event.type}`);
  }

  res.status(200).json({ received: true });
}

async function handleTicketPurchase(session: Stripe.Checkout.Session) {
  const eventId = session.metadata?.event_id;
  const ticketName = session.metadata?.ticket_name;
  const ticketQuantity = session.metadata?.ticket_quantity;
  const ticketPrice = session.amount_total ? session.amount_total / 100 : 0;
  const userId = session.metadata?.user_id;

  if (eventId && ticketName && ticketQuantity) {
    try {
      // Mise à jour de l'événement et des quantités de tickets
      await updateEventAndTicketQuantities(eventId, ticketName);

      // Création du ticket pour l'utilisateur
      const ticketData = {
        eventId: eventId,
        name: ticketName,
        price: ticketPrice,
        purchaseDate: new Date().toISOString(),
        used: false, // Le ticket n'est pas utilisé par défaut
        userId: userId,
      };

      const ticketRef = firestore.collection('tickets').doc();
      await ticketRef.set(ticketData);

      console.log(`Ticket payé réservé pour l'événement ${eventId}.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Erreur lors de la mise à jour des tickets ou de l'enregistrement du ticket : ${error.message}`);
      } else {
        console.error('Erreur inconnue lors de la mise à jour des tickets ou de l\'enregistrement du ticket');
      }
    }
  }
}

async function handleSubscription(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (subscriptionId) {
    try {
      await updateUserSubscription(customerId, subscriptionId);
      console.log(`Abonnement ${subscriptionId} ajouté pour le client ${customerId}.`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`Erreur lors de la mise à jour de l'abonnement : ${error.message}`);
      } else {
        console.error('Erreur inconnue lors de la mise à jour de l\'abonnement');
      }
    }
  }
}

async function updateEventAndTicketQuantities(eventId: string, ticketName: string) {
  try {
    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new Error('Événement non trouvé');
    }

    const eventData = eventDoc.data();
    const tickets = eventData?.tickets;
    const currentGuests = eventData?.currentGuests || 0;

    if (!tickets) {
      throw new Error('Aucun ticket trouvé pour cet événement');
    }

    const ticket = tickets.find((ticket: Ticket) => ticket.name === ticketName);

    if (!ticket) {
      throw new Error(`Ticket avec le nom ${ticketName} non trouvé`);
    }

    if (ticket.quantity <= 0) {
      throw new Error(`Ticket ${ticketName} épuisé`);
    }

    ticket.sold += 1;
    ticket.quantity -= 1;
    const newCurrentGuests = currentGuests + 1;

    await eventRef.update({
      tickets: tickets,
      currentGuests: newCurrentGuests,
    });

    console.log(`Quantité du ticket ${ticketName} mise à jour : ${ticket.quantity} restants, ${ticket.sold} vendus.`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur lors de la mise à jour des tickets : ${error.message}`);
    } else {
      console.error('Erreur inconnue lors de la mise à jour des tickets');
    }
    throw error;
  }
}

async function updateUserSubscription(customerId: string, subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const nickname = subscription.items.data[0].price.metadata.nickname || 'starter';

    const usersRef = firestore.collection('users');
    const querySnapshot = await usersRef.where('stripeCustomerId', '==', customerId).get();

    if (querySnapshot.empty) {
      throw new Error(`Utilisateur avec customerId ${customerId} non trouvé.`);
    }

    const userDoc = querySnapshot.docs[0];

    // 🔥 Mise à jour de Firestore avec le nickname et subscriptionId
    await userDoc.ref.update({
      subscriptionId: subscriptionId,
      nickname: nickname.toLowerCase(),
    });

    console.log(`Mise à jour réussie pour l'utilisateur ${userDoc.id} : abonnement ${subscriptionId}, nickname ${nickname}`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur : ${error.message}`);
    } else {
      console.error("Erreur inconnue lors de la mise à jour de l'utilisateur");
    }
    throw error;
  }
}

