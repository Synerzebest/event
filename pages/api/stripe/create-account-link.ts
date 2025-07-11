import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeConfig";
import { db } from "@/lib/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing UID" });

  try {
    // Créer un nouveau compte Stripe Express
    const account = await stripe.accounts.create({
      type: "express",
    });

    // Stocker l'ID dans Firestore
    await updateDoc(doc(db, "users", uid), {
      stripeAccountId: account.id,
    });

    // Créer le lien d'onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      type: "account_onboarding",
    });

    return res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("Error creating Stripe account/link:", err);
    return res.status(500).json({ error: "Stripe setup failed" });
  }
}
