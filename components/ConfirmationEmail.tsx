import * as React from 'react';

interface ConfirmationEmailProps {
  firstName: string;
  lastName: string;
  eventName: string;
  qrCodeBase64: string;
}

export function ConfirmationEmail({
  firstName,
  lastName,
  eventName,
  qrCodeBase64,
}: ConfirmationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Bonjour {firstName} {lastName},</h1>
      <p>Merci pour votre achat ! Voici votre billet pour <strong>{eventName}</strong>.</p>
      <p>Présentez ce QR code à l’entrée :</p>
      <div style={{ margin: '20px 0' }}>
        <img src={qrCodeBase64} alt="QR Code du billet" width="200" height="200" />
      </div>
      <p>À bientôt sur EaseEvent !</p>
    </div>
  );
}
