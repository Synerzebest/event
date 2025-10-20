import type { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  // Vérification de la validité de l'ID utilisateur
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Référence au document utilisateur dans Firestore
    const userRef = firestore.collection("users").doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const data = userSnap.data() || {};

    // Retourne les événements scannés, ou un tableau vide si aucun
    return res.status(200).json({
      eventScanner: data.scannedEvents || [],
    });
  } catch (error) {
    console.error("Error fetching user scanner events:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
