"use client";

import { useEffect, useState } from "react";
import { stripe } from "@/lib/stripeConfig";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { motion } from "framer-motion";
import Link from "next/link";
import { BankAccount } from "@/types/types";

const StripeAccountDashboard: React.FC = () => {
  const { user } = useFirebaseUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState({
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Stripe account status and bank account details
  useEffect(() => {
    const fetchStripeData = async () => {
      if (!user || !user.stripeAccountId) {
        setStatusMessage("Stripe account not linked. Please connect your account.");
        setLoading(false);
        return;
      }

      try {
        // Fetch Stripe account details
        const account = await stripe.accounts.retrieve(user.stripeAccountId);

        setStripeStatus({
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
          detailsSubmitted: account.details_submitted,
        });

        if (!account.details_submitted) {
          const accountLink = await stripe.accountLinks.create({
            account: user.stripeAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe-dashboard`,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/stripe-dashboard`,
            type: "account_onboarding",
          });

          setStripeUrl(accountLink.url);
        } else {
          setStatusMessage("Your Stripe account is set up and ready.");
        }

        // Fetch bank account details
        const response = await fetch(`/api/stripe/getBankAccountDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: user.stripeAccountId }),
        });

        const data = await response.json();
        setBankAccounts(data.bankAccounts || []);
      } catch (error) {
        console.error("Error fetching Stripe data:", error);
        setStatusMessage("There was an error fetching your account details.");
      } finally {
        setLoading(false);
      }
    };

    fetchStripeData();
  }, [user]);

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-gray-700">Loading your account details...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative top-12 w-full flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-[97%] mx-auto max-w-4xl bg-white border border-gray-200 shadow-lg rounded-xl p-6 space-y-6"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Stripe Account Status */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 text-center">Stripe Dashboard</h1>
          <p className="text-sm text-gray-600 text-center mt-2">{statusMessage}</p>

          <div className="mt-4 space-y-2">
            <p className="text-sm text-gray-700">
              <strong>Status:</strong>{" "}
              {stripeStatus.detailsSubmitted ? "Details Submitted" : "Details Incomplete"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Charges Enabled:</strong> {stripeStatus.chargesEnabled ? "Yes" : "No"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Payouts Enabled:</strong> {stripeStatus.payoutsEnabled ? "Yes" : "No"}
            </p>
          </div>

          {stripeUrl && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-gray-700 text-center">
                Your account is incomplete. Please complete the setup below:
              </p>
              <Link
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-center text-blue-500 hover:underline"
              >
                Complete Stripe Setup
              </Link>
            </motion.div>
          )}
        </div>

        {/* Bank Account Details */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Bank Account</h2>
          {bankAccounts.length > 0 ? (
            <ul className="space-y-4">
              {bankAccounts.map((account) => (
                <li
                  key={account.id}
                  className="p-4 bg-white rounded-lg shadow flex flex-col space-y-2"
                >
                  <p>
                    <strong>Bank Name:</strong> {account.bank_name || "Unknown"}
                  </p>
                  <p>
                    <strong>Account Number:</strong> **** {account.last4}
                  </p>
                  <p>
                    <strong>Country:</strong> {account.country}
                  </p>
                  <p>
                    <strong>Currency:</strong> {account.currency.toUpperCase()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-700">No bank accounts linked.</p>
          )}
        </div>

        {/* Disconnect Button */}
        {/* <button
          className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
          onClick={() => console.log("Handle Stripe disconnection here.")}
        >
          Disconnect Stripe
        </button> */}
      </motion.div>
    </motion.div>
  );
};

export default StripeAccountDashboard;
