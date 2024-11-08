import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./firebaseConfig";

// Définis le type User avec les champs que tu veux utiliser
interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

const useFirebaseUser = () => {
  const [user, setUser] = useState<User | null>(null); // Type explicite
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: FirebaseUser | null) => {
      if (currentUser) {
        // Utilisation des propriétés de Firebase User
        const { displayName, email, photoURL, uid } = currentUser;
        setUser({ displayName, email, photoURL, uid });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
};

export default useFirebaseUser;
