import { Resend } from 'resend';
import { ConfirmationEmail } from '@/components/ConfirmationEmail';
import QRCode from 'qrcode';
import { admin } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import { emailTranslations } from '@/app/i18n/email';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail({
  email,
  firstName,
  lastName,
  eventId,
  ticketId,
  language = 'fr', // par défaut français
}: {
  email: string;
  firstName: string;
  lastName: string;
  eventId: string;
  ticketId: string;
  language?: 'fr' | 'en' | 'nl';
}) {
  try {
    const db = admin.firestore();

    // 1. Récupérer les infos de l'événement
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      throw new Error(`Event ${eventId} not found.`);
    }

    const eventData = eventDoc.data();
    const eventName = eventData?.title || 'Votre événement EaseEvent';

    // 2. Charger les traductions selon la langue
    const t = emailTranslations[language] || emailTranslations['fr'];

    // 3. Générer le QR code
    const qrData = JSON.stringify({ ticketId, eventId });
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { width: 200 });

    // 4. Uploader le QR code sur Firebase Storage
    const bucket = admin.storage().bucket('eventease-fd5ce.appspot.com');
    const filePath = `tickets/${ticketId}.png`;
    const file = bucket.file(filePath);
    const downloadToken = uuidv4();

    await file.save(qrCodeBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken,
        },
      },
    });

    const qrCodeUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      filePath
    )}?alt=media&token=${downloadToken}`;

    // 5. Envoyer l’e-mail via Resend
    await resend.emails.send({
      from: 'EaseEvent <tickets@easeevent.be>',
      to: email,
      subject: t.subject(eventName),
      react: ConfirmationEmail({
        firstName,
        lastName,
        eventName,
        qrCodeBase64: qrCodeUrl,
        t,
      }),
    });

    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error while sending confirmation email:', error);
  }
}
