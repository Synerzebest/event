import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Spin, Skeleton } from 'antd';
// import { getAuth } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

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
  createdBy: string;
}

interface OrganizerSectionProps {
  eventId: string;
}

const OrganizerSection: React.FC<OrganizerSectionProps> = ({ eventId }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  // const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  // useEffect(() => {
  //   const auth = getAuth();
  //   setCurrentUserId(auth.currentUser?.uid ?? null);
  // }, []);

  useEffect(() => {
    const fetchOrganizers = async () => {
      if (!event) return;
      setLoadingOrganizers(true);

      if (Array.isArray(event.organizers) && event.organizers.length > 0) {
        const organizerDetails = await Promise.all(
          event.organizers.map(async (id) => {
            const response = await fetch(`/api/users/${id}`);
            if (response.ok) {
              const userData = await response.json();
              return { id, ...userData };
            }
            return null;
          })
        );

        setOrganizers(organizerDetails.filter(Boolean));
      } else {
        setOrganizers([]);
      }

      setLoadingOrganizers(false);
    };

    fetchOrganizers();
  }, [event]);

  const handleAddOrganizer = async (userId: string) => {
    if (!event) return;
    try {
      const res = await fetch(`/api/events/${event.id}/addOrganizers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizers: [userId] }),
      });

      if (!res.ok) throw new Error();

      const userRes = await fetch(`/api/users/${userId}`);
      if (!userRes.ok) throw new Error();

      const newOrganizer = await userRes.json();
      setOrganizers((prev) =>
        [...prev, { id: userId, ...newOrganizer }].sort((a, b) => a.name.localeCompare(b.name))
      );

      toast.success('Organizer added!');
    } catch {
      toast.error('Failed to add organizer.');
    }
  };

  const handleRemoveOrganizer = async (userId: string) => {
    if (!event) return;
    try {
      const res = await fetch(`/api/removeOrganizer`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, organizerId: userId }),
      });

      if (!res.ok) throw new Error();

      setOrganizers((prev) => prev.filter((org) => org.id !== userId));
      toast.success('Organizer removed!');
    } catch {
      toast.error('Failed to remove organizer.');
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
      <h3 className="text-xl font-bold text-gray-800 mb-4">Organizers ({organizers.length})</h3>

      {loadingOrganizers ? (
        <div className="flex justify-center items-center my-4">
          <Spin />
        </div>
      ) : organizers.length === 0 ? (
        <p className="text-gray-600 mb-4">No organizers yet.</p>
      ) : (
        <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
          <AnimatePresence>
            {organizers.map((org) => {
              const isCreator = org.id === event.createdBy;
              // const isCurrentUser = org.id === currentUserId;
              return (
                <motion.li
                  key={org.id}
                  className="flex items-center justify-between text-gray-700"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <Image src={org.imageUrl} alt={org.name} width={30} height={30} className="rounded-full" />
                    <span className="text-lg">{org.name}</span>
                  </div>
                  {isCreator ? (
                    <span className="text-gray-400 italic">Creator</span>
                  ) : (
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveOrganizer(org.id)}
                    >
                      Remove
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">Add Organizer</h4>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border rounded-lg p-3 w-full bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchQuery && (
          <ul className="space-y-2">
            {users.map((user) => {
              const isAlready = organizers.some((o) => o.id === user.uid);
              return (
                <li key={user.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Image src={user.photoURL} alt={user.displayName} width={30} height={30} className="rounded-full" />
                    <span className="text-lg">{user.displayName}</span>
                  </div>
                  <button
                    className={`text-indigo-500 ${isAlready ? 'cursor-not-allowed text-gray-400' : ''}`}
                    disabled={isAlready}
                    onClick={() => handleAddOrganizer(user.uid)}
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