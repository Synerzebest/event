import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripeConfig";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accountId } = req.body;

  if (!accountId) {
    return res.status(400).json({ error: "Missing accountId" });
  }

  try {
    const bankAccounts = await stripe.accounts.listExternalAccounts(accountId, {
      object: "bank_account",
    });

    res.status(200).json({ bankAccounts: bankAccounts.data });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    res.status(500).json({ error: "Failed to retrieve bank accounts" });
  }
}