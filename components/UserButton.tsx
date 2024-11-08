import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import useFirebaseUser from "@/lib/useFirebaseUser";

const UserButton: React.FC = () => {
  const { user, loading } = useFirebaseUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    await signOut(auth);
    setIsMenuOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      {user ? (
        <div onClick={() => setIsMenuOpen((prev) => !prev)}>
          <img
            src={user.photoURL! || "/images/default-user.jpg"} // Utilisation de `!`
            alt="User profile"
            className="w-8 h-8 rounded-full cursor-pointer"
          />
        </div>
      ) : (
        <p>Not signed in</p>
      )}

      {isMenuOpen && user && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <p className="block px-4 py-2 text-sm text-gray-700">
              {user.displayName! || "User"} {/* Utilisation de `!` */}
            </p>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserButton;
