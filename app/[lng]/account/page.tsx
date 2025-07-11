"use client"

import { useEffect, useState } from "react";
import { stripe } from "@/lib/stripeConfig"; 
import useFirebaseUser from "@/lib/useFirebaseUser";
import { Navbar, PaymentDashboard, Transactions, Footer } from "@/components";
import { db } from "@/lib/firebaseConfig"; 
import { doc, updateDoc } from "firebase/firestore";
import { usePathname } from "next/navigation";
import Link from "next/link";

const StripeOnboarding: React.FC = () => {
  const { user, loading } = useFirebaseUser();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [expressDashboardUrl, setExpressDashboardUrl] = useState<string | null>(null);
  const pathname = usePathname();

  const lng = pathname?.split("/")[1] || "en";

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/stripe/create-account-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user?.uid }),
      });
  
      const data = await res.json();
  
      if (data.url) {
        window.location.href = data.url; // redirection vers Stripe
      } else {
        alert("Failed to create onboarding link.");
      }
    } catch (error) {
      console.error("Stripe connect error:", error);
      alert("Error connecting to Stripe.");
    }
  };
  

  const handleDisconnect = async () => {
    const confirmed = confirm("Are you sure you want to disconnect your Stripe account?");
    if (!confirmed) return;
  
    try {
      const res = await fetch("/api/stripe/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid: user?.uid }),
      });
  
      if (res.ok) {
        // Rediriger ou recharger la page
        location.reload();
      } else {
        alert("Failed to disconnect Stripe account.");
      }
    } catch (err) {
      console.error("Stripe disconnect error:", err);
      alert("An error occurred.");
    }
  };
  

  useEffect(() => {
    const completeOnboarding = async () => {
      if (!user || !user.stripeAccountId) {
        setStatusMessage("No Stripe account linked or missing user data.");
        setLoadingStatus(false);
        return;
      }

      const accountId = user.stripeAccountId;

      try {
        // Vérifier l'état du compte Stripe
        const account = await stripe.accounts.retrieve(accountId);

        if (account.charges_enabled && account.payouts_enabled) {
          setStatusMessage("Your account is now ready to receive payments.");
          
          // Mettre à jour Firestore avec les informations du compte Stripe
          await updateDoc(doc(db, "users", user.uid), {
            accountStatus: "verified",
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
          });
          // Générer le lien vers le Stripe Dashboard
          const loginLink = await stripe.accounts.createLoginLink(accountId);
          setExpressDashboardUrl(loginLink.url);

        } else {
          setStatusMessage("Your account is still under review or incomplete.");
          
          // Créer un lien d'onboarding si le compte est incomplet
          const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,  // URL à utiliser si l'utilisateur annule
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account`,   // URL vers laquelle l'utilisateur sera redirigé après la vérification
            type: 'account_onboarding',  // Type d'account link
          });

          setStripeUrl(accountLink.url); // Récupérer l'URL générée pour l'onboarding
        }
      } catch (error) {
        console.error("Error retrieving account status from Stripe:", error);
        setStatusMessage("There was an error processing your account setup.");
      }

      setLoadingStatus(false);
    };

    if (user) {
      completeOnboarding();
    }

  }, [user]);

  if (loading || loadingStatus) return(
    <>
      <Navbar lng={lng} />
      <div role="status" className="w-screen h-screen flex flex-col items-center justify-center">
        <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </>
  );

  return (
    <>
      <Navbar lng={lng} />

      <div className="w-screen relative top-24 flex flex-col items-center  gap-4">

        {stripeUrl && (
          <Link
            href={stripeUrl}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Complete Stripe Setup
          </Link>
        )}

        {!user?.stripeAccountId && (
          <button
            onClick={handleConnect}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-md transition"
          >
            Connect with Stripe
          </button>
        )}
      
        {statusMessage && <p className="text-[1.5rem] text-center sm:text-4xl font-bold bg-gradient-to-tl from-blue-800 via-blue-500 to-blue-500 bg-clip-text text-transparent">{statusMessage}</p>}

        {expressDashboardUrl && (
          <Link
            href={expressDashboardUrl}
            target="_blank"
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition"
          >
            Go to Stripe Dashboard
          </Link>
        )}

        <PaymentDashboard />

        <Transactions />
      </div>

      <div className="w-full flex items-center justify-center relative top-48 py-12">
        {user?.stripeAccountId && (
          <button
            onClick={handleDisconnect}
            className="text-red-600 border border-red-200 hover:bg-red-50 font-medium px-4 py-2 rounded-md transition"
          >
            Disconnect Stripe Account
          </button>
        )}
      </div>
      

      <Footer />
    </>
  );
};

export default StripeOnboarding;
