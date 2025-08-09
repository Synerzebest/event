import React, { useState, useEffect, useRef, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import useFirebaseUser from "@/lib/useFirebaseUser";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";
import { FiLogOut, FiCreditCard, FiUser } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type Props = { lng: string };

const UserButton: React.FC<Props> = ({ lng }) => {
  const { user, loading } = useFirebaseUser();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const router = useRouter();
  const { t } = useTranslation(lng, "common");

  const closeMenu = useCallback(() => setOpen(false), []);

  const handleSignOut = async () => {
    await signOut(auth);
    closeMenu();
    router.push("/");
  };

  // Clique extérieur + Escape
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [closeMenu]);

  // Focus le 1er item à l’ouverture
  useEffect(() => {
    if (open && firstItemRef.current) firstItemRef.current.focus();
  }, [open]);

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  if (loading) {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" aria-busy="true" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="text-sm font-medium px-3 py-1.5 rounded-full bg-gray-900 text-white hover:opacity-90 transition"
      >
        {safeTranslate(t, "signin")}
      </Link>
    );
  }

  const initials =
    user.displayName?.trim()?.split(/\s+/).map(s => s[0]?.toUpperCase()).slice(0, 2).join("") || "U";

  return (
    <div ref={rootRef} className="relative z-[60]">
      <button
        ref={btnRef}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        onKeyDown={onButtonKeyDown}
        className="inline-flex items-center gap-2 rounded-full px-0 md:px-2 py-1.5 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition"
      >
        {/* Avatar + fallback */}
        <span className="relative inline-flex h-8 w-8 items-center justify-center">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "User"}
              width={32}
              height={32}
              className="rounded-full object-cover"
              priority
            />
          ) : (
            <span className="h-8 w-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-sm font-semibold">
              {initials}
            </span>
          )}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </span>
        <span className="hidden md:block text-sm font-medium text-gray-800 max-w-[10rem] truncate">
          {user.displayName || "User"}
        </span>
      </button>

      {/* Menu animé Framer Motion */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="user-menu"
            role="menu"
            aria-label="User menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="
              absolute origin-top
              left-0 md:left-auto md:right-0
              mt-1 md:mt-2
              w-56 md:w-64
              rounded-2xl bg-white shadow-lg ring-1 ring-black/5
            "
          >
            <div className="p-2">
              {/* Header user */}
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                <div className="relative inline-flex h-10 w-10 items-center justify-center">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="h-10 w-10 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-sm font-semibold">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="my-2 h-px bg-gray-100" />

              {/* Items */}
              <ul className="flex flex-col">
                <li>
                  <Link
                    ref={firstItemRef as React.RefObject<HTMLAnchorElement>}
                    href={`/${lng}/account`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 focus:outline-none duration-300"
                    role="menuitem"
                  >
                    <FiCreditCard className="shrink-0" />
                    <span className="truncate">{safeTranslate(t, "payment_account")}</span>
                  </Link>
                </li>

                {user.subscriptionId && (
                  <li>
                    <Link
                      href={`/${lng}/cancel-subscription`}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 focus:outline-none duration-300"
                      role="menuitem"
                    >
                      <FiUser className="shrink-0" />
                      <span className="truncate">{safeTranslate(t, "cancel_subscription")}</span>
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm text-red-600 hover:bg-red-50 focus:outline-none"
                    role="menuitem"
                  >
                    <FiLogOut className="shrink-0" />
                    <span>{safeTranslate(t, "sign_out")}</span>
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserButton;
