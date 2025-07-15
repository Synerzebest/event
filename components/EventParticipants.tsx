import React, { useEffect, useState, useMemo } from "react";
import { Event } from "@/types/types"

interface TicketParticipant {
  firstName: string;
  lastName: string;
  name: string;
  userId: string;
  eventId: string;
  used: boolean;
  price: number;
  purchaseDate: string;
  id: string;
}

interface EventParticipantsProps {
  eventId: string;
}

const EventParticipants: React.FC<EventParticipantsProps> = ({ eventId }) => {
  const pageSize = 20;
  const [event, setEvent] = useState< Event | null>(null);
  const [allTickets, setAllTickets] = useState<TicketParticipant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchEventInfo = async () => {
    try {
      const res = await fetch(`/api/getEventById/${eventId}`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data);
      }
    } catch (err) {
      console.error("An error occurred while fetching event:", err);
    }
  };

  useEffect(() => {
    fetchEventInfo();
    fetchTickets(true);
  }, [eventId]);
  

  const fetchTickets = async (initial = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/byEvent/${eventId}?pageSize=${pageSize}${lastVisible ? `&last=${lastVisible}` : ''}`);
      const data = await res.json();
      if (res.ok) {
        if (initial) {
          setAllTickets(data.tickets);
        } else {
          setAllTickets(prev => [...prev, ...data.tickets]);
        }
        setLastVisible(data.lastVisible);
        if (data.tickets.length < pageSize) setHasMore(false);
      }
    } catch (err) {
      console.error("Erreur chargement participants", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets(true);
  }, [eventId]);

  const filteredTickets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return allTickets;
    return allTickets.filter(
      t =>
        t.firstName?.toLowerCase().includes(query) ||
        t.lastName?.toLowerCase().includes(query)
    );
  }, [allTickets, searchQuery]);

  return (
    <div className="py-6">
      <h3 className="font-bold text-xl text-gray-800 mb-2">
        Participants ({event?.currentGuests})
      </h3>

      <input
        type="text"
        placeholder="Rechercher un nom ou prénom..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border rounded-lg p-3 w-full bg-gray-100 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {filteredTickets.length === 0 ? (
        <p className="text-gray-600">Aucun participant trouvé.</p>
      ) : (
        <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {filteredTickets.map((ticket) => (
            <li
              key={ticket.id}
              className="flex items-center justify-between text-gray-700 border-b py-2"
            >
              <span>{ticket.firstName} {ticket.lastName}</span>
              <span className="text-sm text-gray-500 italic">{ticket.name}</span>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          onClick={() => fetchTickets()}
          className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Chargement..." : "Charger plus"}
        </button>
      )}
    </div>
  );
};

export default EventParticipants;
