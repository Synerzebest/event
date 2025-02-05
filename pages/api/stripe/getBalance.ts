import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "Missing Stripe account ID" });
  }

  try {
    // Retrieve the balance from Stripe for a connected account
    const balance = await stripe.balance.retrieve({ stripeAccount: accountId });

    // Access the available balance
    const availableBalance = balance.available.find(item => item.currency === 'eur'); // Adjust to match the correct currency
    const pendingBalance = balance.pending.find(item => item.currency === 'eur'); // If you want to check pending balance as well

    // If no available balance is found, return 0
    const amount = availableBalance ? availableBalance.amount / 100 : 0; // Convert from cents to currency

    // Safely check if pendingBalance exists before trying to access its amount
    const pendingAmount = pendingBalance ? pendingBalance.amount / 100 : 0; // If pendingBalance is undefined, default to 0

    return res.status(200).json({
      availableBalance: amount,
      pendingBalance: pendingAmount,
    });
  } catch (error) {
    console.error("Error retrieving Stripe balance:", error);
    return res.status(500).json({ error: "Failed to retrieve balance" });
  }
}
