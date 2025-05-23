import React, { useState, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import useFirebaseUser from "@/lib/useFirebaseUser";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";

const UserButton: React.FC<{ lng: string }> = ({ lng }) => {
  const { user, loading } = useFirebaseUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation(lng, "common");

  const handleStripeConnect = async () => {
    if (!user?.uid) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error("Failed to set up Stripe Connect");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error setting up Stripe Connect:", error);
      alert("Failed to set up Stripe Connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
    router.push('/')
  };

  // Fermer le menu lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return(
      <div role="status" className="w-auto h-auto flex flex-col items-start justify-center">
          <svg aria-hidden="true" className="w-8 h-8 text-white animate-spin dark:text-gray-200 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left z-10" ref={menuRef}>
      {user ? (
        <div onClick={() => setIsMenuOpen((prev) => !prev)}>
          <Image
            src={user.photoURL || "/images/default-user.jpg"}
            alt="User profile"
            width={32}
            height={32}
            className="rounded-full cursor-pointer"
            priority
          />
        </div>
      ) : (
        <p>Not signed in</p>
      )}

      {isMenuOpen && user && (
        <div className="absolute md:right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <p className="block px-4 py-2 text-sm text-gray-700">
              {user.displayName || "User"}
            </p>

            {/* Affichage conditionnel du bouton Stripe Connect */}
            {!user.stripeAccountId ? (
              <button
                onClick={handleStripeConnect}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={isLoading}
              >
                {isLoading ? `${t('setting_up_loading')}` : `${t('setting_up')}`}
              </button>
            ) : (
              <Link
                href={`/${lng}/account`}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {safeTranslate(t,'payment_account')}
              </Link>
            )}

            {user.subscriptionId ? (
              <Link href={`/${lng}/cancel-subscription`} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                {safeTranslate(t,'cancel_subscription')}
              </Link>
            ) : (
              <>
              </>
            )}

            {/* Lien de déconnexion */}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {safeTranslate(t,'sign_out')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;
