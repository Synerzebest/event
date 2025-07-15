import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, lastVisible, pageSize } = req.query;

  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ message: "Missing eventId" });
  }

  const size = parseInt(pageSize as string) || 20;

  try {
    let query = firestore
      .collection("tickets")
      .where("eventId", "==", eventId)
      .orderBy("purchaseDate", "desc")
      .limit(size);

    // Si on a reçu un lastVisible, on l’utilise comme startAfter
    if (lastVisible && typeof lastVisible === "string") {
      const lastDocSnap = await firestore.collection("tickets").doc(lastVisible).get();
      if (lastDocSnap.exists) {
        query = query.startAfter(lastDocSnap);
      } else {
        return res.status(400).json({ message: "Invalid lastVisible ID" });
      }
    }

    const snapshot = await query.get();

    const tickets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    const newLastVisible = snapshot.docs.at(-1)?.id || null;

    return res.status(200).json({ tickets, lastVisible: newLastVisible });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
