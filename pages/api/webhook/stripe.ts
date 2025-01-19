import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { firestore } from '@/lib/firebaseAdmin';

// Initialisation de Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-09-30.acacia',
});

// Désactiver le body parser de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'] as string;

    // Validation de la signature du webhook
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Erreur de validation du webhook : ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Vérifier les types d'événements
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const eventId = session.metadata?.event_id; // Récupération de l'event_id depuis les metadata
      const customerId = session.customer as string; // Utilisation du customerId de Stripe
      const subscriptionId = session.subscription as string; // Récupération de l'ID de l'abonnement
      const ticketName = session.metadata?.ticket_name; // Nom du ticket acheté
      const ticketQuantity = session.metadata?.ticket_quantity; // Quantité du ticket acheté
      console.log(session.metadata)

      console.log(`Paiement réussi pour l'événement ${eventId} du client ${customerId}.`);

      // Mise à jour de l'abonnement
      if (subscriptionId) {
        try {
          await updateUserSubscription(customerId, subscriptionId);
          console.log(`Abonnement ${subscriptionId} ajouté pour le client ${customerId}.`);
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de l'abonnement : ${error.message}`);
        }
      }

      // Mise à jour des tickets dans l'événement
      if (eventId && ticketName && ticketQuantity) {
        try {
          await updateEventAndTicketQuantities(eventId, ticketName, ticketQuantity);
          console.log(`Quantité du ticket ${ticketName} mise à jour pour l'événement ${eventId}.`);
        } catch (error) {
          console.error(`Erreur lors de la mise à jour des tickets : ${error.message}`);
        }
      }

      break;
    }

    default:
      console.log(`Événement non pris en charge: ${event.type}`);
  }

  res.status(200).json({ received: true });
}

// Fonction pour mettre à jour l'utilisateur dans votre base de données
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
    return { userId: userDoc.id, subscriptionId };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'utilisateur : ${error.message}`);
    throw error;
  }
}

// Fonction pour mettre à jour les tickets et l'événement
async function updateEventAndTicketQuantities(eventId: string, ticketName: string, ticketQuantity: string) {
  try {
    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      throw new Error('Événement non trouvé');
    }

    const eventData = eventDoc.data();
    const tickets = eventData?.tickets;
    const currentGuests = eventData?.currentGuests || 0; // Utiliser la valeur actuelle de currentGuests, ou 0 s'il n'existe pas

    if (!tickets) {
      throw new Error('Aucun ticket trouvé pour cet événement');
    }

    // Trouver le ticket correspondant
    const ticket = tickets.find((ticket: any) => ticket.name === ticketName);

    if (!ticket) {
      throw new Error(`Ticket avec le nom ${ticketName} non trouvé`);
    }

    // Vérifier la disponibilité du ticket
    if (ticket.quantity <= 0) {
      throw new Error(`Ticket ${ticketName} épuisé`);
    }

    // Mettre à jour les valeurs de ticket et événement
    ticket.sold += 1; // Incrémenter le nombre de tickets vendus
    ticket.quantity -= 1; // Diminuer la quantité disponible
    const newCurrentGuests = currentGuests + 1; // Incrémenter le nombre total de invités

    // Sauvegarder les changements dans Firestore
    await eventRef.update({
      tickets: tickets,
      currentGuests: newCurrentGuests,
    });

    console.log(`Quantité du ticket ${ticketName} mise à jour : ${ticket.quantity} restants, ${ticket.sold} vendus.`);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des tickets : ${error.message}`);
    throw error;
  }
}
