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
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userSnap.data();
    const stripeAccountId = userData.stripeAccountId;

    if (!stripeAccountId) {
      return res.status(400).json({ error: "no_stripe_account_associated" });
    }

    // 🧠 Récupération des données à jour chez Stripe
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const detailsSubmitted = account.details_submitted;
    const onboardingComplete = chargesEnabled && payoutsEnabled;
    const accountStatus = account.requirements?.currently_due?.length === 0 ? "verified" : "pending";

    // ✅ Met à jour Firestore avec les VRAIES données Stripe
    await updateDoc(userRef, {
      chargesEnabled,
      payoutsEnabled,
      accountStatus,
    });

    const responseData = {
      statusMessage: onboardingComplete
        ? "account_payment_ready"
        : "account_payment_incomplete",
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      stripeAccountId,
    };

    if (onboardingComplete) {
      const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
      return res.status(200).json({
        ...responseData,
        dashboardUrl: loginLink.url,
      });
    } else {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
        type: "account_onboarding",
      });

      return res.status(200).json({
        ...responseData,
        onboardingUrl: accountLink.url,
      });
    }
  } catch (err) {
    console.error("Error checking Stripe status:", err);
    return res.status(500).json({ error: "Stripe status check failed" });
  }
}
