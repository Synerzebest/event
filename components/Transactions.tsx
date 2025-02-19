"use client";

import { useEffect, useState } from "react";
import useFirebaseUser from "@/lib/useFirebaseUser";
import { motion } from "framer-motion";
import { Transaction } from "@/types/types";

const Transactions: React.FC = () => {
  const { user } = useFirebaseUser();
  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStripeData = async () => {
      if (!user || !user.stripeAccountId) return;

      try {
        // Fetch Stripe balance
        const balanceResponse = await fetch(`/api/stripe/getBalance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: user.stripeAccountId }),
        });

        if (!balanceResponse.ok) {
          throw new Error("Failed to fetch balance.");
        }

        const balanceData = await balanceResponse.json();

        // Vérification de 'availableBalance' et 'pendingBalance' dans la réponse
        if (balanceData.pendingBalance !== undefined) {
          setBalance(balanceData.pendingBalance); // Utilisation de 'pendingBalance'
          setCurrency("EUR"); // Si tu connais la devise, sinon tu peux extraire la devise selon les besoins
        } else {
          throw new Error("No balance data found.");
        }

        // Fetch transactions
        const transactionsResponse = await fetch(`/api/stripe/getTransactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: user.stripeAccountId }),
        });

        if (!transactionsResponse.ok) {
          throw new Error("Failed to fetch transactions.");
        }

        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions || []);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred.");
        }
        console.error("Error fetching Stripe data:", error);
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

  if (error) {
    return (
      <motion.div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-red-600">Error: {error}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
        className="relative top-24 w-[97%] mx-auto border border-gray-200 shadow-lg rounded-xl flex flex-col items-center w-full max-w-4xl px-4 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="w-full">
            <section className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Balance</h2>
            {balance !== null ? (
                <p className="text-lg font-medium text-gray-700">
                {balance} {currency}
                </p>
            ) : (
                <p className="text-sm text-gray-600">Unable to fetch balance.</p>
            )}
            </section>

            <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>
            <div className="h-[400px] overflow-y-auto">
                {transactions.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                    <li key={transaction.id} className="py-4 px-2">
                        <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-700 font-medium">
                            <strong>{transaction.description || "Payment"}</strong>
                        </p>
                        <p className="text-sm text-gray-500">
                            {(transaction.amount / 100).toFixed(2)} {transaction.currency.toUpperCase()}
                        </p>
                        </div>
                        <p className="text-sm text-gray-500">
                        Date: {new Date(transaction.created * 1000).toLocaleDateString()}
                        </p>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-gray-600">No transactions found.</p>
                )}
            </div>
            </section>
        </div>
    </motion.div>

  );
};

export default Transactions;
