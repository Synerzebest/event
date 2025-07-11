import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing user ID" });

  try {
    await updateDoc(doc(db, "users", uid), {
      stripeAccountId: null,
      accountStatus: "disconnected",
      chargesEnabled: false,
      payoutsEnabled: false,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Stripe disconnect failed:", err);
    return res.status(500).json({ error: "Failed to disconnect Stripe account" });
  }
}
