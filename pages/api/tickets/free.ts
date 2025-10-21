import { NextApiRequest, NextApiResponse } from 'next';
import { firestore } from '@/lib/firebaseAdmin';
import { sendConfirmationEmail } from "@/lib/email";
import admin from "firebase-admin";

interface Ticket {
  name: string;
  quantity: number;
  sold: number;
}

interface TicketData {
  eventId: string;
  name: string;
  price: number;
  purchaseDate: admin.firestore.Timestamp;
  used: boolean;
  firstName: string;
  lastName: string;
  userEmail: string;
  userId: string | null;
  isGuest: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { eventId, ticketName, userId, firstName, lastName, userEmail } = req.body;

  if (!eventId || !ticketName || !userEmail || !firstName || !lastName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const eventRef = firestore.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) return res.status(404).json({ message: 'Event not found' });

    const eventData = eventDoc.data();
    const tickets = eventData?.tickets;
    const currentGuests = eventData?.currentGuests || 0;

    if (!tickets) return res.status(400).json({ message: 'No tickets available for this event' });

    const ticket = tickets.find((t: Ticket) => t.name === ticketName);
    if (!ticket) return res.status(404).json({ message: `Ticket "${ticketName}" not found.` });

    if (ticket.quantity <= 0)
      return res.status(400).json({ message: `Ticket "${ticketName}" sold out.` });

    // Mise à jour du stock
    ticket.quantity -= 1;
    ticket.sold += 1;
    const updatedGuests = currentGuests + 1;

    await eventRef.update({
      tickets,
      currentGuests: updatedGuests,
    });

    // Construction du ticket typé
    const ticketData: TicketData = {
      eventId,
      name: ticketName,
      price: 0,
      purchaseDate: admin.firestore.Timestamp.now(),
      used: false,
      firstName,
      lastName,
      userEmail,
      userId: userId || null,
      isGuest: !userId,
    };

    // Enregistrement Firestore
    const ticketRef = firestore.collection('tickets').doc();
    await ticketRef.set(ticketData);

    // Enregistrement invité
    if (!userId) {
      const guestRef = firestore.collection('guests').doc(userEmail);

      await guestRef.set(
        {
          email: userEmail,
          firstName,
          lastName,
          events: admin.firestore.FieldValue.arrayUnion({
            eventId,
            ticketId: ticketRef.id,
            ticketName,
            purchaseDate: admin.firestore.Timestamp.now(),
            price: 0,
          }),
          createdAt: admin.firestore.Timestamp.now(),
          lastUpdated: admin.firestore.Timestamp.now(),
        },
        { merge: true }
      );
    }

    // Envoi email
    await sendConfirmationEmail({
      email: userEmail,
      firstName,
      lastName,
      ticketId: ticketRef.id,
      eventId,
    });

    return res.status(200).json({
      message: 'Ticket gratuit réservé avec succès.',
      isGuest: !userId,
      ticketId: ticketRef.id,
    });
  } catch (error) {
    console.error('Erreur lors de la gestion des tickets gratuits:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur.' });
  }
}
