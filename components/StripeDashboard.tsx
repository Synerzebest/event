"use client";

import { useEffect, useState } from "react";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { motion } from "framer-motion";
import Link from "next/link";
import { Spin } from "antd";
import { BankAccount, Transaction } from "@/types/types";
import { FaStripe } from "react-icons/fa6";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";
import useLanguage from "@/lib/useLanguage";

const StripeDashboard: React.FC = () => {
  const { user } = useFirebaseUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [expressDashboardUrl, setExpressDashboardUrl] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState({
    chargesEnabled: false,
    payoutsEnabled: false,
    detailsSubmitted: false,
  });
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string>("EUR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lng = useLanguage();
  const { t } = useTranslation(lng, "stripe_dashboard");

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.stripeAccountId) {
        setStatusMessage(safeTranslate(t, "account_not_linked"));
        setLoading(false);
        return;
      }

      try {
        // Account status
        const statusRes = await fetch("/api/stripe/check-account-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid }),
        });

        const statusData = await statusRes.json();
        setStripeUrl(statusData.onboardingUrl || null);
        setExpressDashboardUrl(statusData.dashboardUrl || null);
        setStatusMessage(statusData.statusMessage || null);
        setStripeStatus({
          chargesEnabled: statusData.chargesEnabled || false,
          payoutsEnabled: statusData.payoutsEnabled || false,
          detailsSubmitted: statusData.detailsSubmitted || false,
        });

        // Bank accounts
        const bankRes = await fetch(`/api/stripe/getBankAccountDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: user.stripeAccountId }),
        });
        const bankData = await bankRes.json();
        setBankAccounts(bankData.bankAccounts || []);

        // Balance
        const balanceRes = await fetch(`/api/stripe/getBalance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: user.stripeAccountId }),
        });
        const balanceData = await balanceRes.json();
        if (balanceData.pendingBalance !== undefined) {
          setBalance(balanceData.pendingBalance);
          setCurrency("EUR");
        }

        // Transactions
        const txRes = await fetch(`/api/stripe/getTransactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: user.stripeAccountId }),
        });
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      } catch (e) {
        console.error("Stripe dashboard error:", e);
        setError("Unable to fetch your Stripe data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 font-medium py-12">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-white shadow-xl border border-gray-100 rounded-2xl p-6 mt-10 space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 text-indigo-600">
        <FaStripe size={28} />
        <h2 className="text-2xl font-semibold">Stripe Dashboard</h2>
      </div>
      <p className="text-sm text-gray-500">{safeTranslate(t, `${statusMessage}`)}</p>

      {/* Stripe Status */}
      <div className="grid sm:grid-cols-3 gap-4 text-sm text-gray-800">
        <p>
          <strong>Details submitted:</strong>{" "}
          {stripeStatus.detailsSubmitted ? "Yes" : "No"}
        </p>
        <p>
          <strong>Charges enabled:</strong>{" "}
          {stripeStatus.chargesEnabled ? "Yes" : "No"}
        </p>
        <p>
          <strong>Payouts enabled:</strong>{" "}
          {stripeStatus.payoutsEnabled ? "Yes" : "No"}
        </p>
      </div>

      {/* Actions */}
      {stripeUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            Complete your account setup to start receiving payments:
          </p>
          <Link
            href={stripeUrl}
            className="inline-block mt-2 text-blue-600 font-medium hover:underline"
          >
            Complete Stripe Setup →
          </Link>
        </div>
      )}
      {expressDashboardUrl && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">Open your Stripe Express dashboard:</p>
          <Link
            href={expressDashboardUrl}
            target="_blank"
            className="inline-block mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Go to Stripe Express
          </Link>
        </div>
      )}

      {/* Bank Account */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-500 mb-2">Bank Account</h3>
        {bankAccounts.length > 0 ? (
          <ul className="space-y-3">
            {bankAccounts.map((account) => (
              <li
                key={account.id}
                className="bg-gray-100 p-4 rounded-lg text-sm text-gray-800"
              >
                <p><strong>Bank:</strong> {account.bank_name || "Unknown"}</p>
                <p><strong>Account Number:</strong> **** {account.last4}</p>
                <p><strong>Country:</strong> {account.country}</p>
                <p><strong>Currency:</strong> {account.currency.toUpperCase()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No bank account linked.</p>
        )}
      </div>

      {/* Balance */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-500 mb-2">Account Balance</h3>
        <p className="text-2xl font-bold text-gray-900">
          {balance !== null ? `${balance} ${currency}` : "Unavailable"}
        </p>
      </div>

      {/* Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-indigo-500 mb-2">Transaction History</h3>
        <div className="h-[300px] overflow-y-auto bg-gray-50 border border-gray-100 rounded-lg p-4">
          {transactions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <li key={tx.id} className="py-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-800">
                      {tx.description || "Payment"}
                    </p>
                    <p className="text-sm text-gray-600 font-semibold">
                      {(tx.amount / 100).toFixed(2)} {tx.currency.toUpperCase()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(tx.created * 1000).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No transactions found.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StripeDashboard;
