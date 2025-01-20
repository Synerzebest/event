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
      const eventId = session.metadata?.event_id;
      const ticketName = session.metadata?.ticket_name;
      const ticketQuantity = session.metadata?.ticket_quantity;
      const ticketPrice = session.amount_total ? session.amount_total / 100 : 0;
      const userId = session.metadata?.user_id;

      if (eventId && ticketName && ticketQuantity) {
        try {
          await updateEventAndTicketQuantities(eventId, ticketName);

          const ticketData = {
            eventId: eventId,
            name: ticketName,
            price: ticketPrice,
            purchaseDate: new Date().toISOString(),
            used: false,
            userId: userId,
          };

          const ticketRef = firestore.collection('tickets').doc();
          await ticketRef.set(ticketData);

          console.log(`Ticket payé réservé pour l'événement ${eventId}.`);
        } catch (error) {
          console.error(`Erreur lors de la mise à jour des tickets ou de l'enregistrement du ticket : ${error.message}`);
        }
      }
      break;
    }
    default:
      console.log(`Événement non pris en charge: ${event.type}`);
  }

  res.status(200).json({ received: true });
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
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des tickets : ${error.message}`);
    throw error;
  }
}