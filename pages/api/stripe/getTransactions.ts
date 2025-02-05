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
    // Retrieve transactions (balance transactions) from Stripe for a connected account
    const transactions = await stripe.balanceTransactions.list(
      { 
        limit: 10, // Adjust limit as needed
      },
      { stripeAccount: accountId } // Use the connected account ID
    );

    return res.status(200).json({ transactions: transactions.data });
  } catch (error) {
    console.error("Error retrieving Stripe transactions:", error);
    return res.status(500).json({ error: "Failed to retrieve transactions" });
  }
}
