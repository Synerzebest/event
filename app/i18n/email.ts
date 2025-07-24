export const emailTranslations = {
    fr: {
      greeting: "Bonjour",
      thankYou: "Merci pour votre réservation ! 🎉",
      ticketInfo: "Voici votre billet pour l’événement :",
      presentQr: "Présentez ce QR code à l’entrée pour valider votre participation :",
      support: "En cas de problème ou de question, n’hésitez pas à nous contacter.",
      signature: "— L’équipe EaseEvent",
      subject: (eventName: string) => `🎟️ Confirmation – ${eventName}`,
    },
    en: {
      greeting: "Hello",
      thankYou: "Thanks for your reservation! 🎉",
      ticketInfo: "Here is your ticket for the event:",
      presentQr: "Please show this QR code at the entrance:",
      support: "If you have any questions, feel free to contact us.",
      signature: "— The EaseEvent Team",
      subject: (eventName: string) => `🎟️ Confirmation – ${eventName}`,
    },
    nl: {
      greeting: "Hallo",
      thankYou: "Bedankt voor je reservering! 🎉",
      ticketInfo: "Hier is je ticket voor het evenement:",
      presentQr: "Toon deze QR-code bij de ingang:",
      support: "Als je vragen hebt, neem dan gerust contact met ons op.",
      signature: "— Het EaseEvent Team",
      subject: (eventName: string) => `🎟️ Bevestiging – ${eventName}`,
    },
  };
  