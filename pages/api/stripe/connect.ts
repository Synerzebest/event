import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeConfig"; // Config Stripe
import { auth, firestore } from "@/lib/firebaseAdmin"; // Firebase Admin config

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Missing userId" });
  }

  try {
    // Récupérer l'utilisateur depuis Firebase Auth
    const userRecord = await auth.getUser(userId);
    const email = userRecord.email;

    if (!email) {
      return res.status(400).json({ message: "User email not found" });
    }

    // Vérifier si l'utilisateur a déjà un compte Stripe dans Firestore
    const userDocRef = firestore.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    const existingStripeAccountId = userDoc.exists ? userDoc.data()?.stripeAccountId : null;

    let stripeAccountId;

    if (existingStripeAccountId) {
      // Si l'utilisateur a déjà un compte Stripe, on l'utilise
      stripeAccountId = existingStripeAccountId;
    } else {
      // Sinon, créer un nouveau compte Stripe
      const account = await stripe.accounts.create({
        type: "express",
        email,
      });

      stripeAccountId = account.id;

      // Sauvegarder l'identifiant du compte Stripe dans Firestore
      await userDocRef.set(
        {
          stripeAccountId,
          payoutsEnabled: account.payouts_enabled,
          chargesEnabled: account.charges_enabled,
          accountStatus: account.requirements?.currently_due?.length == 0 ? 'verified' : 'pending'
        },
        { merge: true } // Merge pour ne pas écraser les autres données utilisateur
      );
    }

    // Générer un lien de configuration Stripe Connect
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error("Error creating or retrieving Stripe Connect account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
