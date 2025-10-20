"use client";
import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Event } from "@/types/types";
import { motion } from "framer-motion";
import { DatePicker, Spin, notification } from "antd";
import Image from "next/image";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import dayjs from "dayjs";
import { UploadFile, RcFile } from "antd/es/upload";

interface EditEventPopupProps {
  event: Event;
  onClose: () => void;
  onUpdateEvent: (updatedEvent: Event) => void;
}

const EditEventPopup: React.FC<EditEventPopupProps> = ({
  event,
  onClose,
  onUpdateEvent,
}) => {
  const [title, setTitle] = useState(event.title);
  const [place, setPlace] = useState(event.place);
  const [city, setCity] = useState(event.city || "");
  const [description, setDescription] = useState(event.description);
  const [eventDate, setEventDate] = useState(dayjs(event.date));
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  // ---- Upload Firebase ----
  const handleUpload = async (file: UploadFile) => {
    if (!file.originFileObj) return "";
    const storageRef = ref(storage, `events/${file.uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file.originFileObj);
    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        () => {},
        reject,
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const imageURLs =
        fileList.length > 0
          ? await Promise.all(fileList.map((f) => handleUpload(f)))
          : event.images;

      const updatedEvent: Event = {
        ...event,
        title,
        place,
        city,
        description,
        date: eventDate.toISOString(),
        images: imageURLs,
      };

      const res = await fetch(`/api/updateEvent/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEvent),
      });

      if (!res.ok) throw new Error("Échec de la mise à jour");

      onUpdateEvent(updatedEvent);
      notification.success({
        message: "Événement mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      onClose();
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Erreur",
        description: "Impossible de mettre à jour l’événement.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-end justify-center z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-0"
        onClick={onClose}
      ></div>

      {/* Drawer principal */}
      <motion.div
        className="bg-white rounded-t-2xl shadow-2xl p-6 z-10 w-full max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl relative overflow-y-scroll h-[90vh] no-scrollbar"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        {/* Bouton fermer */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          <IoMdClose size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Modifier l’événement
        </h2>

        {/* Formulaire compact */}
        <div className="flex flex-col gap-4">
          {/* Ligne 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">
                Titre
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border rounded-md px-3 py-1.5 w-full text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Lieu</label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="border rounded-md px-3 py-1.5 w-full text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Ligne 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Ville</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="border rounded-md px-3 py-1.5 w-full text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Date</label>
              <DatePicker
                className="w-full rounded-md"
                style={{ height: "34px" }}
                value={eventDate}
                onChange={(d) => setEventDate(d || dayjs())}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="border rounded-md px-3 py-1.5 text-sm w-full focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Upload + Save (compact) */}
          <div className="flex items-center justify-between gap-4 mt-2">
            {/* Image cliquable pour changer */}
            <div
            className="relative w-[140px] h-[80px] rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => document.getElementById("event-image-input")?.click()}
            >
            <Image
                src={fileList[0]?.url || event.images?.[0] || "/placeholder.png"}
                alt="Image de l'événement"
                fill
                className="object-cover"
            />
            {/* Overlay léger au survol */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/30 flex items-center justify-center transition">
                <p className="text-white text-[11px] font-medium opacity-0 hover:opacity-100">
                Changer
                </p>
            </div>
            </div>

            {/* Input caché */}
            <input
            id="event-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
              
                const newFile: UploadFile = {
                  uid: String(Date.now()),
                  name: file.name,
                  status: "done",
                  originFileObj: file as RcFile,
                  url: URL.createObjectURL(file),
                };
              
                setFileList([newFile]);
              }}
              
            />

            {/* Bouton enregistrer */}
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={loading}
                className={`px-5 py-2.5 rounded-md font-medium text-white shadow-sm text-sm transition-all duration-200 whitespace-nowrap ${
                loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
                {loading ? (
                <div className="flex items-center gap-2">
                    <Spin size="small" />
                    <span>Enregistrement...</span>
                </div>
                ) : (
                "Enregistrer"
                )}
            </motion.button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EditEventPopup;
