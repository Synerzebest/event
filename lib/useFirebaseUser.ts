import { useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "./firebaseConfig"; // Assurez-vous que db est correctement configuré pour Firestore
import { doc, getDoc } from "firebase/firestore";

// Définition du type User avec les champs nécessaires
interface User {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
  stripeAccountId?: string | null;
  accountStatus?: string; // Optionnel si ce champ n'est pas toujours disponible
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  stripeCustomerId?: string | null;
  subscription?: string | null;
  subscriptionId?: string;
  nickname: string;
}

const useFirebaseUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: FirebaseUser | null) => {
      if (currentUser) {
        try {
          // Récupération des informations utilisateur depuis Firestore
          const userDocRef = doc(db, "users", currentUser.uid); // Assurez-vous que "users" est bien la collection appropriée
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              uid: currentUser.uid,
              stripeAccountId: userData?.stripeAccountId || null,
              accountStatus: userData?.accountStatus || "unknown",
              chargesEnabled: userData?.chargesEnabled || false,
              payoutsEnabled: userData?.payoutsEnabled || false,
              stripeCustomerId: userData?.stripeCustomerId || null,
              subscription: userData?.subscription || null,
              subscriptionId: userData?.subscriptionId || null,
              nickname: userData?.nickname || "starter",
            });
          } else {
            console.warn("Aucun document Firestore trouvé pour cet utilisateur.");
            setUser({
              displayName: currentUser.displayName,
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              uid: currentUser.uid,
              stripeAccountId: null,
              stripeCustomerId: null,
              nickname: "starter"
            });
          }
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données utilisateur depuis Firestore :",
            error
          );
          // En cas d'erreur, définir un utilisateur par défaut basé sur Firebase
          setUser({
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            uid: currentUser.uid,
            stripeAccountId: null,
            stripeCustomerId: null,
            nickname: "starter"
          });
        }
      } else {
        setUser(null); // Aucun utilisateur connecté
      }
      setLoading(false); // Fin du chargement
    });

    return () => unsubscribe(); // Nettoyage lors du démontage
  }, []);

  return { user, loading };
};

export default useFirebaseUser;
