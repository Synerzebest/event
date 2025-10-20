"use client";

import { useEffect, useState } from "react";
import { Navbar, Footer } from "@/components";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Eye, Pencil } from "lucide-react";
import { usePathname } from "next/navigation";
import { Input, Modal, Empty } from "antd";
import Link from "next/link";

type Venue = {
  id: string;
  name: string;
  rows: number;
  cols: number;
};

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(10);
  const [creating, setCreating] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const pathname = usePathname();
  const lng = pathname?.split("/")[1] || "en";

  // Fetch all venues from API
  async function fetchVenues() {
    try {
      setLoading(true);
      const res = await fetch("/api/venues");
      const data = await res.json();
      setVenues(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Create new venue via API
  async function createVenue() {
    if (!name) return alert("Le nom de la salle est requis");
    try {
      setCreating(true);
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rows, cols }),
      });
      const data = await res.json();
      if (res.ok) {
        setVenues((prev) => [...prev, data]);
        setFormOpen(false);
        setName("");
      } else {
        alert("Erreur: " + data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    fetchVenues();
  }, []);

  return (
    <>
      <Navbar lng={lng} />
      <div className="max-w-6xl mx-auto p-6 relative top-24">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Mes salles</h1>
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition text-white rounded-lg px-4 py-2 font-semibold shadow-md"
          >
            <Plus className="w-4 h-4" /> Nouvelle salle
          </button>
        </div>

        <AnimatePresence>
          {formOpen && (
            <motion.div
              className="p-6 mb-6 border border-gray-200 rounded-xl bg-white shadow-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="font-semibold text-lg mb-4 text-gray-700">
                Créer une nouvelle salle
              </h2>
              <div className="flex flex-wrap gap-3 items-center mb-4">
                <Input
                  placeholder="Nom de la salle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-xs"
                />
                <Input
                  type="number"
                  placeholder="Rangées"
                  value={rows}
                  onChange={(e) => setRows(+e.target.value)}
                  className="w-28"
                />
                <Input
                  type="number"
                  placeholder="Colonnes"
                  value={cols}
                  onChange={(e) => setCols(+e.target.value)}
                  className="w-28"
                />
                <button
                  onClick={createVenue}
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded-lg font-semibold"
                >
                  {creating ? (
                    <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                  ) : (
                    "Créer"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
          </div>
        ) : venues.length === 0 ? (
          <Empty
            description="Aucune salle n’a encore été créée."
            className="my-20"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <motion.div
                key={venue.id}
                className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all flex flex-col"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {venue.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {venue.rows} rangées × {venue.cols} colonnes
                  </p>
                  <p className="text-xs text-gray-400 mt-2 mb-3">ID: {venue.id}</p>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    onClick={() => setSelectedVenue(venue)}
                    className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg py-2 text-sm font-semibold transition"
                  >
                    <Eye className="w-4 h-4" /> Visualiser
                  </button>

                  <Link
                    href={`/dashboard/venues/${venue.id}/edit`}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-semibold transition"
                  >
                    <Pencil className="w-4 h-4" /> Modifier
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL VISUALISATION */}
      <Modal
        open={!!selectedVenue}
        onCancel={() => setSelectedVenue(null)}
        footer={null}
        centered
        title={
          <div className="text-center font-bold text-lg">
            {selectedVenue?.name}
          </div>
        }
      >
        {selectedVenue && (
          <div className="flex flex-col items-center justify-center mt-4 mb-6">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${selectedVenue.cols}, 1fr)`,
              }}
            >
              {Array.from({
                length: selectedVenue.rows * selectedVenue.cols,
              }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 bg-indigo-500/80 hover:bg-indigo-600 transition rounded-sm cursor-pointer"
                  title={`Siège ${i + 1}`}
                ></div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              {selectedVenue.rows * selectedVenue.cols} sièges disponibles
            </p>
          </div>
        )}
      </Modal>

      <Footer />
    </>
  );
}
