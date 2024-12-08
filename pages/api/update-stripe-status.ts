import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebaseAdmin"; // Assurez-vous que ce chemin pointe vers votre configuration Firestore

// Fonction pour gérer la requête POST
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { accountId, accountStatus, payoutsEnabled, chargesEnabled } = req.body;

  if (!accountId || typeof accountId !== "string") {
    return res.status(400).json({ error: "Invalid or missing accountId" });
  }

  if (typeof accountStatus !== "string" || typeof payoutsEnabled !== "boolean" || typeof chargesEnabled !== "boolean") {
    return res.status(400).json({ error: "Invalid or missing account status data" });
  }

  try {
    // Mise à jour du statut dans Firestore
    const userDocRef = firestore.collection("users").doc(accountId); // Vous pouvez changer la collection si nécessaire
    await userDocRef.update({
      stripeAccountStatus: accountStatus,
      stripePayoutsEnabled: payoutsEnabled,
      stripeChargesEnabled: chargesEnabled,
      stripeUpdatedAt: new Date(),
    });

    return res.status(200).json({ message: "Stripe account status updated successfully" });
  } catch (error) {
    console.error("Error updating Stripe account status in Firestore:", error);
    return res.status(500).json({ error: "Failed to update account status in Firestore" });
  }
};

export default handler;
