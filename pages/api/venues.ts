import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // Get all venues
      const snapshot = await getDocs(collection(db, "venues"));
      const venues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(venues);
    }

    if (req.method === "POST") {
      const { name, rows, cols } = req.body;

      if (!name || !rows || !cols) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newVenue = {
        name,
        rows,
        cols,
        layout: Array(rows * cols).fill(null),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "venues"), newVenue);
      return res.status(200).json({ id: docRef.id, ...newVenue });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error in /api/venues:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
