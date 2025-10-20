import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing or invalid ID" });
  }

  try {
    // GET: récupérer une salle
    if (req.method === "GET") {
      const ref = doc(db, "venues", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return res.status(404).json({ error: "Venue not found" });
      }

      return res.status(200).json({ id: snap.id, ...snap.data() });
    }

    // PUT: mettre à jour une salle
    if (req.method === "PUT") {
      const updates = req.body;
      const ref = doc(db, "venues", id);
    
      // 🔧 Nettoyage du layout avant envoi
      let safeLayout = updates.layout;
      if (Array.isArray(safeLayout)) {
        safeLayout = safeLayout.map((item) =>
          item === null ? null : { ...item }
        );
      }
    
      await updateDoc(ref, {
        ...updates,
        layout: safeLayout,
        updatedAt: serverTimestamp(),
      });
    
      return res.status(200).json({ message: "Venue updated successfully" });
    }    

    // DELETE: supprimer une salle
    if (req.method === "DELETE") {
      const ref = doc(db, "venues", id);
      await deleteDoc(ref);
      return res.status(200).json({ message: "Venue deleted successfully" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error in /api/venues/[id]:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
