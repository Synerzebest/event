import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeConfig";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing UID" });

  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    const userData = userSnap.data();
    let stripeAccountId = userData.stripeAccountId;

    // Si aucun compte Stripe, on en crée un
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
      });
      stripeAccountId = account.id;

      await updateDoc(userRef, {
        stripeAccountId: account.id,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    // Création d’un lien d’onboarding (utilisé même pour relancer un onboarding interrompu)
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
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
