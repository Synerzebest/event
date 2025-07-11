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
      className="relative top-12 w-full flex justify-center px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full max-w-3xl bg-white border border-gray-100 shadow-xl rounded-2xl p-8 space-y-8"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-indigo-500">Stripe Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{statusMessage}</p>
        </div>

        {/* Stripe Status */}
        <div className="space-y-2 text-sm text-gray-800">
          <p>
            <span className="font-medium text-gray-900">Status:</span>{" "}
            <span className={stripeStatus.detailsSubmitted ? "text-indigo-500" : "text-red-500"}>
              {stripeStatus.detailsSubmitted ? "Details Submitted" : "Details Incomplete"}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-900">Charges Enabled:</span>{" "}
            <span className={stripeStatus.chargesEnabled ? "text-indigo-500" : "text-gray-400"}>
              {stripeStatus.chargesEnabled ? "Yes" : "No"}
            </span>
          </p>
          <p>
            <span className="font-medium text-gray-900">Payouts Enabled:</span>{" "}
            <span className={stripeStatus.payoutsEnabled ? "text-indigo-500" : "text-gray-400"}>
              {stripeStatus.payoutsEnabled ? "Yes" : "No"}
            </span>
          </p>
        </div>

        {stripeUrl && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-sm text-gray-600">
              Your account is incomplete. Please complete the setup below:
            </p>
            <Link
              href={stripeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-indigo-500 font-medium hover:underline transition-colors"
            >
              Complete Stripe Setup
            </Link>
          </motion.div>
        )}

        {/* Bank Account Details */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <h2 className="text-lg font-semibold text-indigo-500 mb-4">Bank Account</h2>
          {bankAccounts.length > 0 ? (
            <ul className="space-y-4">
              {bankAccounts.map((account) => (
                <li
                  key={account.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
                >
                  <p>
                    <span className="font-medium text-gray-900">Bank Name:</span>{" "}
                    {account.bank_name || "Unknown"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Account Number:</span>{" "}
                    **** {account.last4}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Country:</span>{" "}
                    {account.country}
                  </p>
                  <p>
                    <span className="font-medium text-gray-900">Currency:</span>{" "}
                    {account.currency.toUpperCase()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No bank accounts linked.</p>
          )}
        </div>
      </motion.div>
    </motion.div>

  );
};

export default StripeAccountDashboard;
