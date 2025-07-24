import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeConfig";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Missing UID" });

  try {
    // Get user from Firestore
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

    // Read status from Firestore (not from Stripe)
    const chargesEnabled = userData.chargesEnabled ?? false;
    const payoutsEnabled = userData.payoutsEnabled ?? false;
    const onboardingComplete = chargesEnabled && payoutsEnabled;

    // But still retrieve from Stripe whether the account is fully submitted
    const account = await stripe.accounts.retrieve(stripeAccountId);
    const detailsSubmitted = account.details_submitted;

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
