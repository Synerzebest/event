"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Button,
  Input,
  message,
  InputNumber,
  ColorPicker,
  Typography,
} from "antd";
import type { Color } from "antd/es/color-picker";
import useLanguage from "@/lib/useLanguage";
import { Navbar, Footer } from "@/components";

const { Title, Text } = Typography;

type Seat = {
  active?: boolean;
  zone?: string;
  price?: number;
  color?: string;
};

type Venue = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  layout: (null | Seat)[];
};

export default function EditVenuePage() {
  const { id } = useParams<{ id: string }>()!;
  const router = useRouter();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [editZone, setEditZone] = useState("");
  const [editPrice, setEditPrice] = useState<number | null>(null);
  const [editColor, setEditColor] = useState<string>("#6366f1");
  const lng = useLanguage();

  // Charger la salle
  async function fetchVenue() {
    try {
      const res = await fetch(`/api/venues/${id}`);
      const data = await res.json();
      if (!Array.isArray(data.layout)) {
        data.layout = Array(data.rows * data.cols).fill(null);
      }
      setVenue(data);
      setName(data.name);
    } catch (err) {
      console.error(err);
      message.error("Erreur lors du chargement de la salle");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchVenue();
  }, [id]);

  // Sélection / désélection intuitive
  function handleSeatClick(index: number) {
    if (!venue) return;
    const newSelection = [...selectedSeats];
    const isSelected = newSelection.includes(index);

    if (isSelected) {
      setSelectedSeats(newSelection.filter((i) => i !== index));
    } else {
      newSelection.push(index);
      setSelectedSeats(newSelection);
    }
  }

  // Appliquer les changements
  function applyChanges() {
    if (!venue || selectedSeats.length === 0) return;

    const updatedLayout = [...venue.layout];
    for (const idx of selectedSeats) {
      updatedLayout[idx] = {
        active: true,
        zone: editZone || updatedLayout[idx]?.zone || "Standard",
        price: editPrice ?? updatedLayout[idx]?.price ?? 0,
        color: editColor || updatedLayout[idx]?.color || "#6366f1",
      };
    }
    setVenue({ ...venue, layout: updatedLayout });
    message.success(`Modifications appliquées à ${selectedSeats.length} siège(s)`);
  }

  // Sauvegarder en base
  async function saveVenue() {
    if (!venue) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/venues/${venue.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          layout: venue.layout,
        }),
      });  
      if (!res.ok) throw new Error("Failed to update venue");
      message.success("Salle mise à jour !");
    } catch (err) {
      console.error("Error PUT:", err);
      message.error("Error while saving");
    } finally {
      setSaving(false);
    }
  }
  

  if (loading || !venue) {
    return (
      <>
        <Navbar lng={lng} />
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
        </div>
        <Footer />
      </>
    );
  }

  const actionsDisabled = selectedSeats.length === 0;

  return (
    <>
    <Navbar lng={lng} />
    <div className="max-w-7xl mx-auto flex gap-8 relative top-24 p-6">
      {/* COLONNE GAUCHE : grille */}
      <div className="flex-1">
        {/* HEADER */}
        <div className="flex items-center mb-6 gap-4">
          <Button
            onClick={() => router.back()}
            icon={<ArrowLeft size={16} />}
            type="default"
          >
            Retour
          </Button>
          <h1 className="text-2xl font-bold">{venue.name}</h1>
        </div>

        {/* NOM */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold">Nom de la salle</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* GRILLE */}
        <h2 className="font-semibold mb-3">
          Plan de la salle ({venue.rows} rangées × {venue.cols} colonnes)
        </h2>

        <div
          className="grid gap-1 bg-gray-100 p-3 rounded-md mb-6 justify-center select-none"
          style={{
            gridTemplateColumns: `repeat(${venue.cols}, 28px)`,
          }}
        >
          {Array.from({ length: venue.rows * venue.cols }).map((_, i) => {
            const seat = venue.layout[i];
            const isSelected = selectedSeats.includes(i);
            const color =
              seat && seat.active
                ? seat.color || "#6366f1"
                : "#d1d5db";

            return (
              <motion.div
                key={i}
                onClick={() => handleSeatClick(i)}
                className={`w-7 h-7 rounded-sm cursor-pointer border transition`}
                style={{
                  backgroundColor: color,
                  borderColor: isSelected ? "#3b82f6" : "transparent",
                  transform: isSelected ? "scale(1.1)" : "scale(1)",
                }}
                whileTap={{ scale: 0.9 }}
                title={`Siège ${i + 1}`}
              />
            );
          })}
        </div>

        <Button
          type="primary"
          size="large"
          className="bg-indigo-600 hover:bg-indigo-700"
          loading={saving}
          onClick={saveVenue}
        >
          Enregistrer les modifications
        </Button>
      </div>

      {/* COLONNE DROITE : panneau permanent */}
      <div className="w-[340px] bg-white border border-gray-200 rounded-xl shadow-sm p-5 sticky top-24 h-fit">
        <Title level={4}>Actions sur les sièges</Title>
        <Text type="secondary">
          {actionsDisabled
            ? "Aucun siège sélectionné"
            : `${selectedSeats.length} siège(s) sélectionné(s)`}
        </Text>

        <div className="flex flex-col gap-4 mt-5">
          <div>
            <label className="block font-semibold mb-1">Zone</label>
            <Input
              placeholder="Ex: VIP, Balcon..."
              value={editZone}
              onChange={(e) => setEditZone(e.target.value)}
              disabled={actionsDisabled}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Prix (€)</label>
            <InputNumber
              min={0}
              value={editPrice ?? undefined}
              onChange={(val) => setEditPrice(val ?? null)}
              className="w-full"
              disabled={actionsDisabled}
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Couleur de la zone</label>
            <ColorPicker
              value={editColor}
              onChange={(color: Color) => setEditColor(color.toHexString())}
              showText
              size="large"
              disabled={actionsDisabled}
            />
          </div>

          <Button
            type="primary"
            className="bg-indigo-600 hover:bg-indigo-700 mt-4"
            onClick={applyChanges}
            disabled={actionsDisabled}
          >
            Appliquer aux sièges sélectionnés
          </Button>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
