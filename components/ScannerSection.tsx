import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Spin, Skeleton } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from "@/app/i18n";
import { safeTranslate } from "@/lib/utils";

interface Organizer {
  id: string;
  name: string;
  imageUrl: string;
}

interface User {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  name: string;
}

interface Event {
  id: string;
  organizers: string[];
  scanners: string[];
  createdBy: string;
}

interface OrganizerSectionProps {
  eventId: string;
  lng: string;
}

const OrganizerSection: React.FC<OrganizerSectionProps> = ({ eventId, lng }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [scanners, setScanners] = useState<Organizer[]>([]);
  const [loadingScanners, setLoadingScanners] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useTranslation(lng, "common");

  useEffect(() => {
    const fetchEvent = async () => {
      const res = await fetch(`/api/getEventById/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    };
    fetchEvent();
  }, [eventId]);

  useEffect(() => {
    const fetchScanners = async () => {
      if (!event) return;
      setLoadingScanners(true);

      if (Array.isArray(event.scanners) && event.scanners.length > 0) {
        const scannerDetais = await Promise.all(
          event.scanners.map(async (id) => {
            const response = await fetch(`/api/users/${id}`);
            if (response.ok) {
              const userData = await response.json();
              return { id, ...userData };
            }
            return null;
          })
        );

        setScanners(scannerDetais.filter(Boolean));
      } else {
        setScanners([]);
      }

      setLoadingScanners(false);
    };

    fetchScanners();
  }, [event]);

  const handleAddScanner = async (userId: string) => {
    if (!event) return;
    try {
      const res = await fetch(`/api/events/${event.id}/addScanners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanners: [userId] }),
      });

      if (!res.ok) throw new Error();

      const userRes = await fetch(`/api/users/${userId}`);
      if (!userRes.ok) throw new Error();

      const newScanner = await userRes.json();
      setScanners((prev) =>
        [...prev, { id: userId, ...newScanner }].sort((a, b) => a.name.localeCompare(b.name))
      );

      toast.success('Scanner added!');
    } catch {
      toast.error('Failed to add scanner.');
    }
  };

  const handleRemoveScanner = async (userId: string) => {
    if (!event) return;
    try {
      const res = await fetch(`/api/events/removeScanner`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, scannerId: userId }),
      });

      if (!res.ok) throw new Error();

      setScanners((prev) => prev.filter((scanner) => scanner.id !== userId));
      toast.success('Scanner removed!');
    } catch {
      toast.error('Failed to remove scanner.');
    }
  };

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    if (!query) return setUsers([]);

    const res = await fetch(`/api/searchUsers?query=${query}`);
    if (res.ok) setUsers(await res.json());
  };

  if (!event) {
    return (
        <div className="w-full">
            <Skeleton.Input active />
        </div>
    )
  }

  return (
    <motion.div className="py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <h3 className="text-xl font-bold text-gray-800 mb-4">{safeTranslate(t, "organizing_team")} ({scanners.length})</h3>

      {loadingScanners ? (
        <div className="flex justify-center items-center my-4">
          <Spin />
        </div>
      ) : scanners.length === 0 ? (
        <p className="text-gray-600 mb-4">No scanners yet.</p>
      ) : (
        <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
          <AnimatePresence>
            {scanners.map((scanner) => {
              const isCreator = scanner.id === event.createdBy;
              // const isCurrentUser = org.id === currentUserId;
              return (
                <motion.li
                  key={scanner.id}
                  className="flex items-center justify-between text-gray-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <Image src={scanner.imageUrl} alt={scanner.name} width={30} height={30} className="rounded-full" />
                    <span className="text-lg">{scanner.name}</span>
                  </div>
                  {isCreator ? (
                    <span className="text-gray-400 italic">{safeTranslate(t, "creator")}</span>
                  ) : (
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveScanner(scanner.id)}
                    >
                      {safeTranslate(t, "remove")}
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">{safeTranslate(t, "add_organizer")}</h4>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border rounded-lg p-3 w-full bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchQuery && (
          <ul className="space-y-2 max-h-[300px] overflow-y-scroll">
            {users.map((user) => {
              const isAlready = scanners.some((s) => s.id === user.uid);
              return (
                <li key={user.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src={user.photoURL} alt={user.displayName} width={30} height={30} className="rounded-full" />
                    <span className="text-lg">{user.displayName}</span>
                  </div>
                  <button
                    className={`text-indigo-500 ${isAlready ? 'cursor-not-allowed text-gray-400' : ''}`}
                    disabled={isAlready}
                    onClick={() => handleAddScanner(user.uid)}
                  >
                    {isAlready ? 'Added' : 'Add'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.div>
  );
};

export default OrganizerSection;