import { Resend } from 'resend';
import { ConfirmationEmail } from '@/components/ConfirmationEmail';
import QRCode from 'qrcode';
import { admin } from '@/lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail({
  email,
  firstName,
  lastName,
  eventName,
  ticketId,
  eventId
}: {
  email: string;
  firstName: string;
  lastName: string;
  eventName: string;
  ticketId: string;
  eventId: string;
}) {
  try {
    // 1. Générer les données QR
    const qrData = JSON.stringify({ ticketId, eventId });
    const qrCodeBuffer = await QRCode.toBuffer(qrData, { width: 200 });

    // 2. Créer un chemin unique pour le ticket
    const filePath = `tickets/${ticketId}.png`;

    // 3. Uploader vers Firebase Storage avec token d’accès public
    const bucket = admin.storage().bucket('eventease-fd5ce.appspot.com');
    const file = bucket.file(filePath);

    const downloadToken = uuidv4();

    await file.save(qrCodeBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          firebaseStorageDownloadTokens: downloadToken
        }
      }
    });

    const qrCodeUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${downloadToken}`;

    // 4. Envoyer le mail avec l'URL hébergée du QR code
    await resend.emails.send({
      from: 'EaseEvent <tickets@easeevent.be>',
      to: email,
      subject: `Confirmation: merci pour votre achat`,
      react: ConfirmationEmail({
        firstName,
        lastName,
        eventName,
        qrCodeBase64: qrCodeUrl,
      })
    });

    console.log(`Email de confirmation envoyé à ${email}`);
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’email de confirmation :', error);
  }
}
