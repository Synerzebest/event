import { NextApiRequest, NextApiResponse } from "next";
import { firestore } from "@/lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId } = req.query;

  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ message: "Missing eventId" });
  }

  try {
    const ticketsSnapshot = await firestore
      .collection("tickets")
      .where("eventId", "==", eventId)
      .get();

    const tickets = ticketsSnapshot.docs.map((doc) => doc.data());

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
