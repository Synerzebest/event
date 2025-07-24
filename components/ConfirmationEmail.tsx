import * as React from "react";

interface ConfirmationEmailProps {
  firstName: string;
  lastName: string;
  eventName: string;
  qrCodeBase64: string;
  t: {
    greeting: string;
    thankYou: string;
    ticketInfo: string;
    presentQr: string;
    support: string;
    signature: string;
  };
}

export function ConfirmationEmail({
  firstName,
  lastName,
  eventName,
  qrCodeBase64,
  t,
}: ConfirmationEmailProps) {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif",
        backgroundColor: "#f9f9f9",
        padding: "40px 20px",
        color: "#1f1f1f",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#fff",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
        }}
      >
        <img
          src="https://firebasestorage.googleapis.com/v0/b/eventease-fd5ce.appspot.com/o/logo%2Flogo.png?alt=media&token=30e2b3d4-922e-4a7c-9f93-51c91ac362f8"
          alt="EaseEvent Logo"
          style={{
            height: "40px",
            marginBottom: "20px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />

        <h2 style={{ color: "#222" }}>
          {t.greeting} {firstName} {lastName},
        </h2>

        <p>{t.thankYou}</p>

        <p>{t.ticketInfo}</p>

        <h3 style={{ color: "#4b3eff" }}>{eventName}</h3>

        <p>{t.presentQr}</p>

        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <img
            src={qrCodeBase64}
            alt="QR Code du billet"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "10px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <p>{t.support}</p>

        <p style={{ marginTop: "40px", fontSize: "14px", color: "#888" }}>
          {t.signature}
        </p>
      </div>

      <div
        style={{
          maxWidth: "600px",
          margin: "20px auto 0",
          textAlign: "center",
          fontSize: "12px",
          color: "#aaa",
        }}
      >
        © {new Date().getFullYear()} EaseEvent. Tous droits réservés.
      </div>
    </div>
  );
}
